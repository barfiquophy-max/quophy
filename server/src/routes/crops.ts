import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { HttpError } from '../middleware/error.js';

export const cropsRouter = Router();
cropsRouter.use(requireAuth);

const cropSchema = z.object({
  farmId: z.string().uuid(),
  cropType: z.string().min(2, 'Choose a crop type'),
  variety: z.string().max(100).optional().or(z.literal('')),
  plantingDate: z.string().optional().or(z.literal('')),
  expectedHarvestDate: z.string().optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

async function ensureOwnCrop(req: AuthedRequest) {
  const { rows } = await query(
    `SELECT c.*, f.user_id FROM crops c JOIN farms f ON f.id = c.farm_id WHERE c.id = $1`,
    [req.params.id],
  );
  if (!rows[0]) throw new HttpError(404, 'Crop not found.');
  if (rows[0].user_id !== req.user!.id && req.user!.role !== 'admin') {
    throw new HttpError(403, 'This crop belongs to another user.');
  }
  return rows[0];
}

async function ensureOwnFarmId(farmId: string, userId: string, role: string) {
  const { rows } = await query('SELECT user_id FROM farms WHERE id = $1', [farmId]);
  if (!rows[0]) throw new HttpError(404, 'Farm not found.');
  if (rows[0].user_id !== userId && role !== 'admin') {
    throw new HttpError(403, 'This farm belongs to another user.');
  }
}

cropsRouter.get('/', async (req: AuthedRequest, res) => {
  const all = req.user!.role === 'admin' && req.query.all === 'true';
  const { rows } = await query(
    `SELECT c.*, f.farm_name, f.location AS farm_location,
       (SELECT json_agg(json_build_object('id', a.id, 'status', a.status, 'condition', a.detected_condition,
          'confidence', a.confidence, 'severity', a.severity, 'createdAt', a.created_at, 'imageUrl', a.image_url)
          ORDER BY a.created_at DESC)
        FROM analyses a WHERE a.crop_id = c.id) AS analyses
     FROM crops c JOIN farms f ON f.id = c.farm_id
     ${all ? '' : 'WHERE f.user_id = $1'}
     ORDER BY c.created_at DESC`,
    all ? [] : [req.user!.id],
  );
  res.json({ crops: rows });
});

cropsRouter.post('/', validate(cropSchema), async (req: AuthedRequest, res) => {
  const { farmId, cropType, variety, plantingDate, expectedHarvestDate, notes } = req.body;
  await ensureOwnFarmId(farmId, req.user!.id, req.user!.role);
  const { rows } = await query(
    `INSERT INTO crops (farm_id, crop_type, variety, planting_date, expected_harvest_date, notes)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [farmId, cropType, variety || null, plantingDate || null, expectedHarvestDate || null, notes || null],
  );
  res.status(201).json({ crop: rows[0] });
});

cropsRouter.get('/:id', async (req: AuthedRequest, res) => {
  const crop = await ensureOwnCrop(req);
  const { rows: analyses } = await query(
    'SELECT * FROM analyses WHERE crop_id = $1 ORDER BY created_at DESC',
    [crop.id],
  );
  const { rows: alerts } = await query(
    `SELECT * FROM alerts WHERE alert_type IN ('pest','disease','weather','treatment')
     ORDER BY created_at DESC LIMIT 10`,
  );
  res.json({ crop, analyses, alerts });
});

cropsRouter.patch(
  '/:id',
  validate(
    z.object({
      cropType: z.string().min(2).optional(),
      variety: z.string().optional(),
      plantingDate: z.string().optional(),
      expectedHarvestDate: z.string().optional(),
      status: z.enum(['growing', 'healthy', 'attention', 'harvested']).optional(),
      healthScore: z.number().min(0).max(100).optional(),
      notes: z.string().optional(),
    }),
  ),
  async (req: AuthedRequest, res) => {
    const crop = await ensureOwnCrop(req);
    const b = req.body;
    const { rows } = await query(
      `UPDATE crops SET
         crop_type = COALESCE($2, crop_type), variety = COALESCE($3, variety),
         planting_date = COALESCE($4, planting_date), expected_harvest_date = COALESCE($5, expected_harvest_date),
         status = COALESCE($6, status), health_score = COALESCE($7, health_score),
         notes = COALESCE($8, notes)
       WHERE id = $1 RETURNING *`,
      [
        crop.id,
        b.cropType ?? null,
        b.variety ?? null,
        b.plantingDate || null,
        b.expectedHarvestDate || null,
        b.status ?? null,
        b.healthScore ?? null,
        b.notes ?? null,
      ],
    );
    res.json({ crop: rows[0] });
  },
);

cropsRouter.delete('/:id', async (req: AuthedRequest, res) => {
  const crop = await ensureOwnCrop(req);
  await query('DELETE FROM crops WHERE id = $1', [crop.id]);
  res.json({ message: 'Crop deleted.' });
});

// Conditions knowledge base (public read, admin write happens in admin routes)
cropsRouter.get('/meta/conditions', async (_req, res) => {
  const { rows } = await query('SELECT * FROM conditions ORDER BY kind, name');
  res.json({ conditions: rows });
});
