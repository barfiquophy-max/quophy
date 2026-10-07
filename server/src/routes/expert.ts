import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { requireAuth, requireRole, type AuthedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { HttpError } from '../middleware/error.js';

export const expertRouter = Router();
expertRouter.use(requireAuth, requireRole('expert', 'admin'));

expertRouter.get('/cases', async (req: AuthedRequest, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const { rows } = await query(
    `SELECT r.*, a.crop_type, a.image_url, a.detected_condition, a.confidence, a.severity,
            a.status AS ai_status, a.symptoms, a.location, a.created_at AS analyzed_at,
            u.name AS farmer_name, u.location AS farmer_location
     FROM expert_reviews r
     JOIN analyses a ON a.id = r.analysis_id
     JOIN users u ON u.id = r.farmer_id
     ${status ? 'WHERE r.status = $1' : ''}
     ORDER BY r.urgent DESC, r.created_at DESC`,
    status ? [status] : [],
  );
  res.json({ cases: rows });
});

expertRouter.get('/cases/:id', async (req: AuthedRequest, res) => {
  const { rows } = await query(
    `SELECT r.*, a.*, r.id AS review_id, r.status AS review_status,
            u.name AS farmer_name, u.location AS farmer_location, u.phone AS farmer_phone
     FROM expert_reviews r
     JOIN analyses a ON a.id = r.analysis_id
     JOIN users u ON u.id = r.farmer_id
     WHERE r.id = $1`,
    [req.params.id],
  );
  if (!rows[0]) throw new HttpError(404, 'Case not found.');
  res.json({ case: rows[0] });
});

expertRouter.patch(
  '/cases/:id',
  validate(
    z.object({
      status: z.enum(['pending', 'under_review', 'resolved']).optional(),
      comments: z.string().max(2000).optional(),
      recommendation: z.string().max(2000).optional(),
      correctedCondition: z.string().max(200).optional(),
    }),
  ),
  async (req: AuthedRequest, res) => {
    const b = req.body;
    const { rows } = await query(
      `UPDATE expert_reviews SET
         status = COALESCE($2, status),
         comments = COALESCE($3, comments),
         recommendation = COALESCE($4, recommendation),
         expert_id = $5,
         updated_at = now()
       WHERE id = $1 RETURNING *`,
      [req.params.id, b.status ?? null, b.comments ?? null, b.recommendation ?? null, req.user!.id],
    );
    const review = rows[0];
    if (!review) throw new HttpError(404, 'Case not found.');
    if (b.correctedCondition) {
      await query('UPDATE analyses SET detected_condition = $1 WHERE id = $2', [
        b.correctedCondition,
        review.analysis_id,
      ]);
    }
    if (b.status === 'resolved' || b.recommendation) {
      await query(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES ($1, 'Expert reviewed your case', $2, 'expert', $3)`,
        [
          review.farmer_id,
          b.recommendation
            ? `Expert advice: ${String(b.recommendation).slice(0, 140)}`
            : 'An agricultural expert has responded to your case.',
          `/analyses/${review.analysis_id}`,
        ],
      );
    }
    res.json({ review });
  },
);

expertRouter.get('/stats', async (_req: AuthedRequest, res) => {
  const { rows } = await query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
       COUNT(*) FILTER (WHERE status = 'under_review')::int AS under_review,
       COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved,
       COUNT(*) FILTER (WHERE urgent AND status != 'resolved')::int AS urgent
     FROM expert_reviews`,
  );
  res.json({ stats: rows[0] });
});
