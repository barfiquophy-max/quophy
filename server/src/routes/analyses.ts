import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { z } from 'zod';
import { query, withTransaction } from '../db/pool.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { HttpError } from '../middleware/error.js';
import { analyzeCrop } from '../services/ai.js';
import { config } from '../config.js';

export const analysesRouter = Router();
analysesRouter.use(requireAuth);

const uploadDir = path.resolve('uploads');
await import('node:fs').then((fs) => fs.mkdirSync(uploadDir, { recursive: true }));

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: config.maxUploadMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(new HttpError(400, 'Please upload a JPG, JPEG or PNG image of your crop.'));
      return;
    }
    cb(null, true);
  },
});

analysesRouter.get('/', async (req: AuthedRequest, res) => {
  const all = req.user!.role === 'admin' && req.query.all === 'true';
  const { rows } = await query(
    `SELECT a.*, c.crop_type AS linked_crop_type, f.farm_name
     FROM analyses a
     LEFT JOIN crops c ON c.id = a.crop_id
     LEFT JOIN farms f ON f.id = a.farm_id
     ${all ? '' : 'WHERE a.user_id = $1'}
     ORDER BY a.created_at DESC LIMIT 200`,
    all ? [] : [req.user!.id],
  );
  res.json({ analyses: rows });
});

analysesRouter.post('/', upload.single('image'), async (req: AuthedRequest, res) => {
  if (!req.file) {
    throw new HttpError(400, 'Please upload a clear image of the crop or affected area.');
  }
  const cropId = req.body.cropId || null;
  const farmId = req.body.farmId || null;
  if (cropId) {
    const { rows } = await query(
      `SELECT c.id FROM crops c JOIN farms f ON f.id = c.farm_id WHERE c.id = $1 AND f.user_id = $2`,
      [cropId, req.user!.id],
    );
    if (!rows[0] && req.user!.role !== 'admin') throw new HttpError(403, 'That crop is not yours.');
  }
  if (farmId) {
    const { rows } = await query('SELECT id FROM farms WHERE id = $1 AND user_id = $2', [
      farmId,
      req.user!.id,
    ]);
    if (!rows[0] && req.user!.role !== 'admin') throw new HttpError(403, 'That farm is not yours.');
  }

  const result = await analyzeCrop({
    imagePath: req.file.path,
    imageMime: req.file.mimetype,
    cropType: req.body.cropType,
    symptoms: req.body.symptoms,
    location: req.body.location,
    notes: req.body.notes,
  });

  const analysis = await withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO analyses
        (user_id, farm_id, crop_id, image_url, crop_type, symptoms, location, notes,
         status, detected_condition, confidence, severity, symptoms_detected, cause,
         recommendations, prevention, needs_expert_review, is_mock)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       RETURNING *`,
      [
        req.user!.id,
        farmId,
        cropId,
        `/uploads/${req.file!.filename}`,
        req.body.cropType || result.crop,
        req.body.symptoms || null,
        req.body.location || null,
        req.body.notes || null,
        result.status,
        result.condition,
        result.confidence,
        result.severity,
        JSON.stringify(result.symptomsDetected),
        result.cause,
        JSON.stringify(result.recommendations),
        JSON.stringify(result.prevention),
        result.needsExpertReview,
        result.isMock,
      ],
    );
    // Update the linked crop's health from the new analysis.
    if (cropId) {
      const statusMap: Record<string, string> = {
        healthy: 'healthy',
        possible_pest: 'attention',
        possible_disease: 'attention',
        possible_stress: 'attention',
        undetermined: 'growing',
      };
      const healthPenalty: Record<string, number> = { Low: 10, Moderate: 25, High: 45, None: 0 };
      await client.query(
        `UPDATE crops SET
           status = $2,
           health_score = GREATEST(0, LEAST(100, 100 - $3))
         WHERE id = $1`,
        [cropId, statusMap[result.status] ?? 'growing', healthPenalty[result.severity] ?? 0],
      );
    }
    await client.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES ($1, $2, $3, 'analysis', $4)`,
      [
        req.user!.id,
        `Analysis complete: ${result.crop}`,
        result.status === 'healthy'
          ? 'Good news — your crop looks healthy.'
          : `${result.condition} (${Math.round(result.confidence * 100)}% confidence). Tap to view recommendations.`,
        `/analyses/${rows[0].id}`,
      ],
    );
    return rows[0];
  });

  res.status(201).json({ analysis, indicators: result.indicators });
});

analysesRouter.get('/:id', async (req: AuthedRequest, res) => {
  const { rows } = await query(
    `SELECT a.*, u.name AS farmer_name, c.crop_type AS linked_crop_type, f.farm_name
     FROM analyses a
     JOIN users u ON u.id = a.user_id
     LEFT JOIN crops c ON c.id = a.crop_id
     LEFT JOIN farms f ON f.id = a.farm_id
     WHERE a.id = $1`,
    [req.params.id],
  );
  const a = rows[0];
  if (!a) throw new HttpError(404, 'Analysis not found.');
  const isOwner = a.user_id === req.user!.id;
  const isExpertOnCase =
    req.user!.role === 'expert' &&
    (await query('SELECT 1 FROM expert_reviews WHERE analysis_id = $1', [a.id])).rows.length > 0;
  if (!isOwner && req.user!.role !== 'admin' && !isExpertOnCase) {
    throw new HttpError(403, 'You do not have access to this analysis.');
  }
  const { rows: reviews } = await query(
    `SELECT r.*, e.name AS expert_name FROM expert_reviews r
     LEFT JOIN users e ON e.id = r.expert_id WHERE r.analysis_id = $1`,
    [a.id],
  );
  res.json({ analysis: a, reviews });
});

// Request an expert review for an analysis
analysesRouter.post(
  '/:id/request-review',
  (req, res, next) => {
    const parsed = z
      .object({ comment: z.string().max(1000).optional(), urgent: z.boolean().optional() })
      .safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid request.' });
    next();
  },
  async (req: AuthedRequest, res) => {
    const { rows } = await query('SELECT * FROM analyses WHERE id = $1', [req.params.id]);
    const a = rows[0];
    if (!a) throw new HttpError(404, 'Analysis not found.');
    if (a.user_id !== req.user!.id) throw new HttpError(403, 'This analysis is not yours.');
    const existing = await query(
      `SELECT id FROM expert_reviews WHERE analysis_id = $1 AND status != 'resolved'`,
      [a.id],
    );
    if (existing.rows[0]) {
      return res.status(409).json({ error: 'An expert review is already open for this analysis.' });
    }
    const { rows: review } = await query(
      `INSERT INTO expert_reviews (analysis_id, farmer_id, request_comment, urgent)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [a.id, req.user!.id, req.body.comment || null, !!req.body.urgent],
    );
    res.status(201).json({ review: review[0] });
  },
);
