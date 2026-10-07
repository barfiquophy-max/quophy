import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { requireAuth, requireRole, type AuthedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { HttpError } from '../middleware/error.js';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole('admin'));

// ---- Users ----
adminRouter.get('/users', async (req: AuthedRequest, res) => {
  const role = typeof req.query.role === 'string' ? req.query.role : undefined;
  const { rows } = await query(
    `SELECT id, name, email, phone, role, location, email_verified, created_at
     FROM users ${role ? 'WHERE role = $1' : ''} ORDER BY created_at DESC`,
    role ? [role] : [],
  );
  res.json({ users: rows });
});

adminRouter.patch(
  '/users/:id',
  validate(
    z.object({
      role: z.enum(['farmer', 'expert', 'admin']).optional(),
      emailVerified: z.boolean().optional(),
      name: z.string().min(2).optional(),
      location: z.string().optional(),
    }),
  ),
  async (req: AuthedRequest, res) => {
    const b = req.body;
    const { rows } = await query(
      `UPDATE users SET role = COALESCE($2, role), email_verified = COALESCE($3, email_verified),
         name = COALESCE($4, name), location = COALESCE($5, location)
       WHERE id = $1
       RETURNING id, name, email, phone, role, location, email_verified, created_at`,
      [req.params.id, b.role ?? null, b.emailVerified ?? null, b.name ?? null, b.location ?? null],
    );
    if (!rows[0]) throw new HttpError(404, 'User not found.');
    res.json({ user: rows[0] });
  },
);

adminRouter.post(
  '/users/:id/reset-password',
  validate(z.object({ password: z.string().min(8) })),
  async (req, res) => {
    const hash = await bcrypt.hash(req.body.password, 10);
    const { rows } = await query('UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id', [
      hash,
      req.params.id,
    ]);
    if (!rows[0]) throw new HttpError(404, 'User not found.');
    res.json({ message: 'Password reset.' });
  },
);

adminRouter.delete('/users/:id', async (req: AuthedRequest, res) => {
  if (req.params.id === req.user!.id) throw new HttpError(400, 'You cannot delete your own account.');
  const { rows } = await query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);
  if (!rows[0]) throw new HttpError(404, 'User not found.');
  res.json({ message: 'User deleted.' });
});

// ---- Conditions (pests & diseases knowledge base) ----
const conditionSchema = z.object({
  name: z.string().min(2),
  kind: z.enum(['pest', 'disease', 'deficiency', 'stress']),
  affectedCrops: z.array(z.string()).default([]),
  description: z.string().optional().or(z.literal('')),
  symptoms: z.array(z.string()).default([]),
  treatments: z.array(z.string()).default([]),
  prevention: z.array(z.string()).default([]),
});

adminRouter.get('/conditions', async (_req, res) => {
  const { rows } = await query('SELECT * FROM conditions ORDER BY kind, name');
  res.json({ conditions: rows });
});

adminRouter.post('/conditions', validate(conditionSchema), async (req, res) => {
  const b = req.body;
  const { rows } = await query(
    `INSERT INTO conditions (name, kind, affected_crops, description, symptoms, treatments, prevention)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [b.name, b.kind, b.affectedCrops, b.description || null, b.symptoms, b.treatments, b.prevention],
  );
  res.status(201).json({ condition: rows[0] });
});

adminRouter.patch('/conditions/:id', validate(conditionSchema.partial()), async (req, res) => {
  const b = req.body;
  const { rows } = await query(
    `UPDATE conditions SET
       name = COALESCE($2, name), kind = COALESCE($3, kind),
       affected_crops = COALESCE($4, affected_crops), description = COALESCE($5, description),
       symptoms = COALESCE($6, symptoms), treatments = COALESCE($7, treatments),
       prevention = COALESCE($8, prevention)
     WHERE id = $1 RETURNING *`,
    [
      req.params.id,
      b.name ?? null,
      b.kind ?? null,
      b.affectedCrops ?? null,
      b.description ?? null,
      b.symptoms ?? null,
      b.treatments ?? null,
      b.prevention ?? null,
    ],
  );
  if (!rows[0]) throw new HttpError(404, 'Condition not found.');
  res.json({ condition: rows[0] });
});

adminRouter.delete('/conditions/:id', async (req, res) => {
  const { rows } = await query('DELETE FROM conditions WHERE id = $1 RETURNING id', [req.params.id]);
  if (!rows[0]) throw new HttpError(404, 'Condition not found.');
  res.json({ message: 'Condition deleted.' });
});

// ---- Alerts management ----
const alertSchema = z.object({
  title: z.string().min(2),
  message: z.string().min(2),
  alertType: z.enum(['pest', 'disease', 'crop', 'weather', 'treatment', 'general']),
  location: z.string().optional().or(z.literal('')),
  severity: z.enum(['info', 'warning', 'critical']).default('info'),
});

adminRouter.get('/alerts', async (_req, res) => {
  const { rows } = await query('SELECT * FROM alerts ORDER BY created_at DESC');
  res.json({ alerts: rows });
});

adminRouter.post('/alerts', validate(alertSchema), async (req: AuthedRequest, res) => {
  const b = req.body;
  const { rows } = await query(
    `INSERT INTO alerts (title, message, alert_type, location, severity, created_by)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [b.title, b.message, b.alertType, b.location || null, b.severity, req.user!.id],
  );
  // Fan out to matching farmers as notifications.
  await query(
    `INSERT INTO notifications (user_id, title, message, type)
     SELECT u.id, $1, $2, 'alert' FROM users u
     WHERE u.role = 'farmer' AND (
       $3 IS NULL OR $3 = '' OR u.location IS NULL OR u.location = ''
       OR u.location ILIKE '%' || $3 || '%' OR $3 ILIKE '%' || u.location || '%'
     )`,
    [b.title, b.message, b.location || null],
  );
  res.status(201).json({ alert: rows[0] });
});

adminRouter.patch('/alerts/:id', validate(alertSchema.partial()), async (req, res) => {
  const b = req.body;
  const { rows } = await query(
    `UPDATE alerts SET
       title = COALESCE($2, title), message = COALESCE($3, message),
       alert_type = COALESCE($4, alert_type), location = COALESCE($5, location),
       severity = COALESCE($6, severity)
     WHERE id = $1 RETURNING *`,
    [req.params.id, b.title ?? null, b.message ?? null, b.alertType ?? null, b.location ?? null, b.severity ?? null],
  );
  if (!rows[0]) throw new HttpError(404, 'Alert not found.');
  res.json({ alert: rows[0] });
});

adminRouter.delete('/alerts/:id', async (req, res) => {
  const { rows } = await query('DELETE FROM alerts WHERE id = $1 RETURNING id', [req.params.id]);
  if (!rows[0]) throw new HttpError(404, 'Alert not found.');
  res.json({ message: 'Alert deleted.' });
});

// ---- Reports / analytics ----
adminRouter.get('/reports', async (_req, res) => {
  const [users, analyses, reviews, byCondition, byStatus, byRegion, daily] = await Promise.all([
    query(`SELECT COUNT(*)::int AS total,
             COUNT(*) FILTER (WHERE role='farmer')::int AS farmers,
             COUNT(*) FILTER (WHERE role='expert')::int AS experts,
             COUNT(*) FILTER (WHERE role='admin')::int AS admins
           FROM users`),
    query(`SELECT COUNT(*)::int AS total,
             COUNT(*) FILTER (WHERE status='healthy')::int AS healthy,
             COUNT(*) FILTER (WHERE status!='healthy' AND status!='undetermined')::int AS detected,
             AVG(confidence)::numeric(4,3) AS avg_confidence
           FROM analyses`),
    query(`SELECT COUNT(*) FILTER (WHERE status='pending')::int AS pending,
             COUNT(*) FILTER (WHERE status='under_review')::int AS under_review,
             COUNT(*) FILTER (WHERE status='resolved')::int AS resolved
           FROM expert_reviews`),
    query(`SELECT detected_condition AS name, COUNT(*)::int AS count
           FROM analyses WHERE detected_condition IS NOT NULL AND status != 'healthy'
           GROUP BY detected_condition ORDER BY count DESC LIMIT 8`),
    query(`SELECT status AS name, COUNT(*)::int AS count FROM analyses GROUP BY status`),
    query(`SELECT COALESCE(NULLIF(location,''),'Unknown') AS name, COUNT(*)::int AS count
           FROM analyses WHERE status NOT IN ('healthy','undetermined')
           GROUP BY 1 ORDER BY count DESC LIMIT 8`),
    query(`SELECT to_char(created_at::date, 'YYYY-MM-DD') AS day, COUNT(*)::int AS count
           FROM analyses WHERE created_at > now() - interval '30 days'
           GROUP BY 1 ORDER BY 1`),
  ]);
  res.json({
    users: users.rows[0],
    analyses: analyses.rows[0],
    reviews: reviews.rows[0],
    topConditions: byCondition.rows,
    statusBreakdown: byStatus.rows,
    regionalOutbreaks: byRegion.rows,
    dailyAnalyses: daily.rows,
  });
});

adminRouter.get('/analyses', async (_req, res) => {
  const { rows } = await query(
    `SELECT a.*, u.name AS farmer_name, u.email AS farmer_email
     FROM analyses a JOIN users u ON u.id = a.user_id
     ORDER BY a.created_at DESC LIMIT 300`,
  );
  res.json({ analyses: rows });
});
