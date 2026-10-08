import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { HttpError } from '../middleware/error.js';

export const farmsRouter = Router();
farmsRouter.use(requireAuth);

const farmSchema = z.object({
  farmName: z.string().min(2, 'Give your farm a name'),
  location: z.string().max(200).optional().or(z.literal('')),
  size: z.number().positive().optional().nullable(),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

async function ensureOwnFarm(req: AuthedRequest) {
  const { rows } = await query('SELECT * FROM farms WHERE id = $1', [req.params.id]);
  if (!rows[0]) throw new HttpError(404, 'Farm not found.');
  if (rows[0].user_id !== req.user!.id && req.user!.role !== 'admin') {
    throw new HttpError(403, 'This farm belongs to another user.');
  }
  return rows[0];
}

farmsRouter.get('/', async (req: AuthedRequest, res) => {
  const userFilter = req.user!.role === 'admin' && req.query.all === 'true' ? '' : 'WHERE f.user_id = $1';
  const params = userFilter ? [req.user!.id] : [];
  const { rows } = await query(
    `SELECT f.*, COUNT(c.id)::int AS crop_count,
            COUNT(c.id) FILTER (WHERE c.status = 'attention')::int AS attention_count
     FROM farms f LEFT JOIN crops c ON c.farm_id = f.id
     ${userFilter}
     GROUP BY f.id ORDER BY f.created_at DESC`,
    params,
  );
  res.json({ farms: rows });
});

farmsRouter.post('/', validate(farmSchema), async (req: AuthedRequest, res) => {
  const { farmName, location, size, notes } = req.body;
  const { rows } = await query(
    `INSERT INTO farms (user_id, farm_name, location, size, notes) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [req.user!.id, farmName, location || null, size ?? null, notes || null],
  );
  res.status(201).json({ farm: rows[0] });
});

farmsRouter.get('/:id', async (req: AuthedRequest, res) => {
  const farm = await ensureOwnFarm(req);
  const { rows: crops } = await query(
    'SELECT * FROM crops WHERE farm_id = $1 ORDER BY created_at DESC',
    [farm.id],
  );
  res.json({ farm, crops });
});

farmsRouter.patch('/:id', validate(farmSchema.partial()), async (req: AuthedRequest, res) => {
  const farm = await ensureOwnFarm(req);
  const b = req.body;
  const { rows } = await query(
    `UPDATE farms SET
       farm_name = COALESCE($2, farm_name),
       location = COALESCE($3, location),
       size = COALESCE($4, size),
       notes = COALESCE($5, notes)
     WHERE id = $1 RETURNING *`,
    [farm.id, b.farmName ?? null, b.location ?? null, b.size ?? null, b.notes ?? null],
  );
  res.json({ farm: rows[0] });
});

farmsRouter.delete('/:id', async (req: AuthedRequest, res) => {
  const farm = await ensureOwnFarm(req);
  await query('DELETE FROM farms WHERE id = $1', [farm.id]);
  res.json({ message: 'Farm deleted.' });
});
