import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { HttpError } from '../middleware/error.js';

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);

notificationsRouter.get('/', async (req: AuthedRequest, res) => {
  const { rows } = await query(
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100',
    [req.user!.id],
  );
  const unread = rows.filter((r) => !r.read).length;
  res.json({ notifications: rows, unread });
});

notificationsRouter.post('/:id/read', async (req: AuthedRequest, res) => {
  const { rows } = await query(
    'UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2 RETURNING id',
    [req.params.id, req.user!.id],
  );
  if (!rows[0]) throw new HttpError(404, 'Notification not found.');
  res.json({ message: 'Marked as read.' });
});

notificationsRouter.post('/read-all', async (req: AuthedRequest, res) => {
  await query('UPDATE notifications SET read = TRUE WHERE user_id = $1', [req.user!.id]);
  res.json({ message: 'All notifications marked as read.' });
});

notificationsRouter.delete('/:id', async (req: AuthedRequest, res) => {
  const { rows } = await query(
    'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
    [req.params.id, req.user!.id],
  );
  if (!rows[0]) throw new HttpError(404, 'Notification not found.');
  res.json({ message: 'Notification deleted.' });
});
