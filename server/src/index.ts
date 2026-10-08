import './middleware/asyncify.js'; // must load before any router is built
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { config } from './config.js';
import { authRouter } from './routes/auth.js';
import { farmsRouter } from './routes/farms.js';
import { cropsRouter } from './routes/crops.js';
import { analysesRouter } from './routes/analyses.js';
import { alertsRouter } from './routes/alerts.js';
import { notificationsRouter } from './routes/notifications.js';
import { expertRouter } from './routes/expert.js';
import { adminRouter } from './routes/admin.js';
import { errorHandler, notFound } from './middleware/error.js';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: config.isDev ? true : config.clientOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));

app.use(
  '/api/auth',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false }),
);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/uploads', express.static(path.resolve('uploads'), { maxAge: '7d' }));

app.use('/api/auth', authRouter);
app.use('/api/farms', farmsRouter);
app.use('/api/crops', cropsRouter);
app.use('/api/analyses', analysesRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/expert', expertRouter);
app.use('/api/admin', adminRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Quophy API listening on http://localhost:${config.port}`);
});
