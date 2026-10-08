import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { query } from '../db/pool.js';

export interface AuthedRequest extends Request {
  user?: { id: string; role: 'farmer' | 'expert' | 'admin'; name: string; email: string };
}

export function signToken(userId: string, role: string, remember = false): string {
  return jwt.sign({ sub: userId, role }, config.jwtSecret, {
    expiresIn: (remember ? '30d' : config.jwtExpiresIn) as jwt.SignOptions['expiresIn'],
  });
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: 'Authentication required.' });
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { sub: string; role: string };
    const { rows } = await query<{ id: string; name: string; email: string; role: 'farmer' | 'expert' | 'admin' }>(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [payload.sub],
    );
    if (!rows[0]) return res.status(401).json({ error: 'Account not found.' });
    req.user = rows[0];
    next();
  } catch {
    return res.status(401).json({ error: 'Your session has expired. Please log in again.' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to access this.' });
    }
    next();
  };
}
