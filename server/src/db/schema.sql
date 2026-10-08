CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer','expert','admin')),
  location TEXT,
  profile_image TEXT,
  farm_info TEXT,
  preferred_language TEXT DEFAULT 'en',
  notification_prefs JSONB NOT NULL DEFAULT '{"alerts":true,"weather":true,"reminders":true,"expert":true}',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('verify','reset')),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_user ON auth_tokens(user_id, type);

CREATE TABLE IF NOT EXISTS farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farm_name TEXT NOT NULL,
  location TEXT,
  size NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_farms_user ON farms(user_id);

CREATE TABLE IF NOT EXISTS crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  crop_type TEXT NOT NULL,
  variety TEXT,
  planting_date DATE,
  expected_harvest_date DATE,
  status TEXT NOT NULL DEFAULT 'growing' CHECK (status IN ('growing','healthy','attention','harvested')),
  health_score INTEGER NOT NULL DEFAULT 100 CHECK (health_score BETWEEN 0 AND 100),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crops_farm ON crops(farm_id);

CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farm_id UUID REFERENCES farms(id) ON DELETE SET NULL,
  crop_id UUID REFERENCES crops(id) ON DELETE SET NULL,
  image_url TEXT,
  crop_type TEXT,
  symptoms TEXT,
  location TEXT,
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('healthy','possible_pest','possible_disease','possible_stress','undetermined')),
  detected_condition TEXT,
  confidence NUMERIC(4,3),
  severity TEXT,
  symptoms_detected JSONB NOT NULL DEFAULT '[]',
  cause TEXT,
  recommendations JSONB NOT NULL DEFAULT '[]',
  prevention JSONB NOT NULL DEFAULT '[]',
  needs_expert_review BOOLEAN NOT NULL DEFAULT FALSE,
  is_mock BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_analyses_user ON analyses(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_crop ON analyses(crop_id);

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  alert_type TEXT NOT NULL DEFAULT 'general' CHECK (alert_type IN ('pest','disease','crop','weather','treatment','general')),
  location TEXT,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expert_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expert_id UUID REFERENCES users(id) ON DELETE SET NULL,
  request_comment TEXT,
  comments TEXT,
  recommendation TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','under_review','resolved')),
  urgent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON expert_reviews(status);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('pest','disease','deficiency','stress')),
  affected_crops TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  symptoms TEXT[] NOT NULL DEFAULT '{}',
  treatments TEXT[] NOT NULL DEFAULT '{}',
  prevention TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
