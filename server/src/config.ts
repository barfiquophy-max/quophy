import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl:
    process.env.DATABASE_URL ??
    'postgres://quophy:quophy_dev_pw@localhost:5432/quophy',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '12h',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB ?? 8),
  aiProviderUrl: process.env.AI_PROVIDER_URL ?? '',
  aiProviderApiKey: process.env.AI_PROVIDER_API_KEY ?? '',
  isDev: (process.env.NODE_ENV ?? 'development') !== 'production',
};
