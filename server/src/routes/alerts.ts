import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';

export const alertsRouter = Router();
alertsRouter.use(requireAuth);

// Farmers see global alerts plus alerts matching their location (case-insensitive contains).
alertsRouter.get('/', async (req: AuthedRequest, res) => {
  const me = await query('SELECT location FROM users WHERE id = $1', [req.user!.id]);
  const loc = me.rows[0]?.location ?? '';
  const { rows } = await query(
    `SELECT * FROM alerts
     WHERE location IS NULL OR location = '' OR $1 = '' OR location ILIKE '%' || $1 || '%'
        OR $1 ILIKE '%' || location || '%'
     ORDER BY created_at DESC LIMIT 100`,
    [loc],
  );
  res.json({ alerts: rows });
});
