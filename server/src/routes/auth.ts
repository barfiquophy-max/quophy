import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { config } from '../config.js';
import { requireAuth, signToken, type AuthedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const authRouter = Router();

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password needs at least one uppercase letter')
  .regex(/[a-z]/, 'Password needs at least one lowercase letter')
  .regex(/[0-9]/, 'Password needs at least one number');

const registerSchema = z.object({
  name: z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^\+?[0-9\s-]{7,15}$/, 'Please enter a valid phone number').optional().or(z.literal('')),
  password: passwordSchema,
  location: z.string().max(200).optional().or(z.literal('')),
  // Admins are provisioned by existing admins — never through public signup.
  role: z.enum(['farmer', 'expert']).default('farmer'),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'You must accept the Terms & Conditions' }) }),
  acceptPrivacy: z.literal(true, { errorMap: () => ({ message: 'You must accept the Privacy Policy' }) }),
});

function publicUser(u: any) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    location: u.location,
    profileImage: u.profile_image,
    farmInfo: u.farm_info,
    preferredLanguage: u.preferred_language,
    notificationPrefs: u.notification_prefs,
    emailVerified: u.email_verified,
    createdAt: u.created_at,
  };
}

async function createToken(userId: string, type: 'verify' | 'reset') {
  const code = String(crypto.randomInt(100000, 999999));
  await query(
    `INSERT INTO auth_tokens (user_id, code, type, expires_at) VALUES ($1,$2,$3, now() + interval '30 minutes')`,
    [userId, code, type],
  );
  // In production this is emailed/SMS'd. In dev it is returned to the client.
  return code;
}

authRouter.post('/register', validate(registerSchema), async (req, res) => {
  const { name, email, phone, password, location, role } = req.body;
  const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows[0]) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await query(
    `INSERT INTO users (name, email, phone, password_hash, role, location)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [name, email.toLowerCase(), phone || null, hash, role, location || null],
  );
  const code = await createToken(rows[0].id, 'verify');
  res.status(201).json({
    user: publicUser(rows[0]),
    message: 'Account created. Please verify your email.',
    ...(config.isDev ? { devCode: code } : {}),
  });
});

authRouter.post('/verify', async (req, res) => {
  const { email, code } = req.body ?? {};
  if (!email || !code) return res.status(400).json({ error: 'Email and code are required.' });
  const { rows } = await query(
    `SELECT t.id, t.expires_at, t.used, u.id AS user_id FROM auth_tokens t
     JOIN users u ON u.id = t.user_id
     WHERE u.email = $1 AND t.code = $2 AND t.type = 'verify'
     ORDER BY t.created_at DESC LIMIT 1`,
    [String(email).toLowerCase(), String(code)],
  );
  const tok = rows[0];
  if (!tok || tok.used || new Date(tok.expires_at) < new Date()) {
    return res.status(400).json({ error: 'That verification code is invalid or has expired.' });
  }
  await query('UPDATE auth_tokens SET used = TRUE WHERE id = $1', [tok.id]);
  await query('UPDATE users SET email_verified = TRUE WHERE id = $1', [tok.user_id]);
  res.json({ message: 'Email verified. You can now log in.' });
});

authRouter.post(
  '/login',
  validate(
    z.object({
      identifier: z.string().min(1, 'Enter your email or phone number'),
      password: z.string().min(1, 'Enter your password'),
      remember: z.boolean().optional(),
    }),
  ),
  async (req, res) => {
    const { identifier, password, remember } = req.body;
    const id = identifier.toLowerCase();
    const { rows } = await query(
      'SELECT * FROM users WHERE email = $1 OR phone = $2',
      [id, identifier],
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'The email or password is incorrect.' });
    }
    if (!user.email_verified) {
      const code = await createToken(user.id, 'verify');
      return res.status(403).json({
        error: 'Please verify your email before logging in.',
        needsVerification: true,
        email: user.email,
        ...(config.isDev ? { devCode: code } : {}),
      });
    }
    res.json({ token: signToken(user.id, user.role, !!remember), user: publicUser(user) });
  },
);

authRouter.post(
  '/forgot',
  validate(z.object({ email: z.string().email() })),
  async (req, res) => {
    const { rows } = await query('SELECT id FROM users WHERE email = $1', [
      req.body.email.toLowerCase(),
    ]);
    // Always respond the same way so emails cannot be enumerated.
    if (!rows[0]) return res.json({ message: 'If that account exists, a reset code has been sent.' });
    const code = await createToken(rows[0].id, 'reset');
    res.json({
      message: 'If that account exists, a reset code has been sent.',
      ...(config.isDev ? { devCode: code } : {}),
    });
  },
);

authRouter.post(
  '/reset',
  validate(z.object({ email: z.string().email(), code: z.string().min(4), password: passwordSchema })),
  async (req, res) => {
    const { email, code, password } = req.body;
    const { rows } = await query(
      `SELECT t.id, t.expires_at, t.used, u.id AS user_id FROM auth_tokens t
       JOIN users u ON u.id = t.user_id
       WHERE u.email = $1 AND t.code = $2 AND t.type = 'reset'
       ORDER BY t.created_at DESC LIMIT 1`,
      [email.toLowerCase(), code],
    );
    const tok = rows[0];
    if (!tok || tok.used || new Date(tok.expires_at) < new Date()) {
      return res.status(400).json({ error: 'That reset code is invalid or has expired.' });
    }
    const hash = await bcrypt.hash(password, 10);
    await query('UPDATE auth_tokens SET used = TRUE WHERE id = $1', [tok.id]);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, tok.user_id]);
    res.json({ message: 'Password updated. You can log in with your new password.' });
  },
);

authRouter.get('/me', requireAuth, async (req: AuthedRequest, res) => {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.user!.id]);
  res.json({ user: publicUser(rows[0]) });
});

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().regex(/^\+?[0-9\s-]{7,15}$/, 'Please enter a valid phone number').optional().or(z.literal('')),
  location: z.string().max(200).optional().or(z.literal('')),
  farmInfo: z.string().max(1000).optional().or(z.literal('')),
  preferredLanguage: z.string().max(10).optional(),
  notificationPrefs: z
    .object({
      alerts: z.boolean(),
      weather: z.boolean(),
      reminders: z.boolean(),
      expert: z.boolean(),
    })
    .partial()
    .optional(),
  profileImage: z.string().max(500).optional().or(z.literal('')),
});

authRouter.patch('/me', requireAuth, validate(profileSchema), async (req: AuthedRequest, res) => {
  const b = req.body;
  const { rows } = await query(
    `UPDATE users SET
       name = COALESCE($2, name),
       phone = COALESCE($3, phone),
       location = COALESCE($4, location),
       farm_info = COALESCE($5, farm_info),
       preferred_language = COALESCE($6, preferred_language),
       notification_prefs = notification_prefs || COALESCE($7, '{}'::jsonb),
       profile_image = COALESCE($8, profile_image)
     WHERE id = $1 RETURNING *`,
    [
      req.user!.id,
      b.name ?? null,
      b.phone ?? null,
      b.location ?? null,
      b.farmInfo ?? null,
      b.preferredLanguage ?? null,
      b.notificationPrefs ? JSON.stringify(b.notificationPrefs) : null,
      b.profileImage ?? null,
    ],
  );
  res.json({ user: publicUser(rows[0]) });
});

authRouter.post(
  '/me/password',
  requireAuth,
  validate(z.object({ current: z.string().min(1), next: passwordSchema })),
  async (req: AuthedRequest, res) => {
    const { rows } = await query('SELECT password_hash FROM users WHERE id = $1', [req.user!.id]);
    if (!(await bcrypt.compare(req.body.current, rows[0].password_hash))) {
      return res.status(400).json({ error: 'Your current password is incorrect.' });
    }
    const hash = await bcrypt.hash(req.body.next, 10);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user!.id]);
    res.json({ message: 'Password changed.' });
  },
);
