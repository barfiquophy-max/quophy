# Quophy — AI-Powered Crop Pest & Disease Alert System

A full-stack agricultural technology platform that helps farmers identify, monitor and
respond to crop pests and diseases early — before damage becomes severe.

Built for three roles:

- **Farmers** — upload crop photos, get an AI health check, monitor crops, receive alerts, request expert review.
- **Agricultural Experts** — review farmer cases flagged by the AI or submitted for a second opinion.
- **Administrators** — manage users, the pest/disease knowledge base, alerts, and view platform analytics.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion + Recharts |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL 16 (Docker) |
| Auth | JWT + bcrypt password hashing + email verification & password reset codes |
| AI | Replaceable AI service interface — ships with a clearly-labeled **mock** implementation |

## Project Structure

```
quophy/
├── client/                 # React SPA (Vite)
│   └── src/
│       ├── api/            # Axios client
│       ├── auth/           # AuthContext / session
│       ├── components/     # Design system + app layout (sidebar, topbar, mobile nav)
│       ├── pages/
│       │   ├── Landing.tsx
│       │   ├── auth/       # Login, Register, VerifyEmail, ForgotPassword
│       │   ├── farmer/     # Dashboard, Analyze, AnalysisResult, Farms, Crops, CropDetail,
│       │   │               # History, Alerts, ExpertSupport
│       │   ├── expert/     # Dashboard, Cases, CaseDetail
│       │   ├── admin/      # Dashboard, Users, Conditions, Analyses, Alerts, Reports
│       │   └── shared/     # Notifications, Profile, Settings
│       └── utils/
├── server/                 # Express REST API
│   └── src/
│       ├── db/             # pool, schema.sql, migrate.ts, seed.ts
│       ├── middleware/     # auth (JWT + RBAC), validate (zod), error
│       ├── routes/         # auth, farms, crops, analyses, alerts, notifications, expert, admin
│       └── services/ai.ts  # AI service interface + mock implementation
└── docker-compose.yml      # PostgreSQL
```

## Getting Started

### 1. Prerequisites
- Node.js 20+
- Docker (for PostgreSQL) — or any reachable Postgres instance

### 2. Install dependencies
```bash
npm install
npm --prefix server install
npm --prefix client install
```

### 3. Start the database & seed demo data
```bash
npm run db:up          # docker compose up -d db
npm run db:migrate     # create tables
npm run db:seed        # demo users, crops, conditions, alerts
```

### 4. Configure environment
```bash
cp server/.env.example server/.env
```

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `postgres://quophy:quophy_dev_pw@localhost:5432/quophy` | Postgres connection |
| `JWT_SECRET` | dev value | **Change in production** |
| `PORT` | `4000` | API port |
| `CLIENT_ORIGIN` | `http://localhost:5173` | CORS origin in production |
| `MAX_UPLOAD_MB` | `8` | Upload size limit |
| `AI_PROVIDER_URL` / `AI_PROVIDER_API_KEY` | unset | Point to a real model endpoint to replace the mock |

### 5. Run the app
```bash
npm run dev
```
- Client: http://localhost:5173 (proxies `/api` and `/uploads` to the API)
- API: http://localhost:4000

## Demo Credentials

Password for all seed accounts: `Password1`

| Role | Email |
| --- | --- |
| Farmer | `farmer@quophy.app` |
| Expert | `expert@quophy.app` |
| Admin | `admin@quophy.app` |

> New registrations require email verification. In development (no SMTP configured),
> the 6-digit code is shown on-screen instead of being emailed. Same for password resets.

## The AI Service

`server/src/services/ai.ts` exposes one function — `analyzeCrop(input) → AiResult` — with
two implementations behind it:

- **Mock (default)**: a deterministic heuristic that scores entries in the pest/disease
  knowledge base against crop type + reported symptoms, then returns confidence,
  severity, symptoms, recommendations and prevention advice. Every result carries
  `is_mock: true` and the UI labels it "Simulated AI result".
- **Remote**: when `AI_PROVIDER_URL` is set, the same function POSTs to that endpoint
  and maps the response onto the same contract. No client changes needed.

### Connecting a real model
Implement the contract below (or adapt `remoteAnalyze`), set `AI_PROVIDER_URL` +
`AI_PROVIDER_API_KEY`, and the whole app switches over — upload handling, validation,
result storage and the review workflow are already in place.

```json
POST /api/analyses  (multipart: image + cropType, symptoms, location, notes)
→ {
  "status": "possible_disease",
  "crop": "Tomato",
  "condition": "Possible Early Blight",
  "confidence": 0.91,
  "severity": "Moderate",
  "symptomsDetected": ["Leaf spots", "Yellowing"],
  "recommendations": ["Remove severely affected leaves", "Improve airflow"],
  "prevention": ["Monitor plants regularly", "Avoid prolonged leaf wetness"],
  "needsExpertReview": false
}
```

## Features

- **Landing page** — hero, how-it-works, features, early-detection, stats, testimonials, CTA.
- **Auth** — register (validation, password strength, terms/privacy), login (+remember me),
  email verification, forgot/reset password, protected routes, role-based access.
- **Farmer** — dashboard (stat cards, quick actions, latest alert, recent analyses),
  AI analyze flow (drag & drop, camera capture, staged scanning animation),
  diagnosis result page (confidence meter, severity, recommendations, prevention),
  farm CRUD, crop monitoring with health bars, history, alerts, expert support, profile, settings.
- **Expert** — case queue (pending/under review/resolved, urgent flag), case detail with
  AI context, comment + recommendation + corrected diagnosis back to the farmer.
- **Admin** — user management (roles, verify, delete), pest/disease knowledge-base CRUD
  (the data the mock AI reasons over), alert broadcast with regional targeting,
  analyses table, reports (charts: daily analyses, top conditions, outcomes, regional outbreaks).
- **Platform** — notifications with unread counter, mobile bottom nav, skeleton-friendly
  loading states, accessible labels, image compression before upload, PWA manifest.

## Security

- bcrypt password hashing, JWT sessions, role-based authorization on every protected route
- zod input validation, image type/size limits, rate limiting on `/api/auth`
- Ownership checks: farmers only see their own farms/crops/analyses
- Helmet headers, CORS locked to client origin outside dev

## Remaining Limitations / Next Steps

1. **Real AI model** — the analysis is a labeled simulation. Wire a real CV model/API to
   `AI_PROVIDER_URL` (see above) — optionally add image bytes to the request payload.
2. **Real email/SMS** — verification & reset codes are displayed in dev. Plug an SMTP/SMS
   provider into `createToken` in `routes/auth.ts`.
3. **Refresh tokens** — sessions are single JWTs (12h / 30d remember-me).
4. **Image hosting** — uploads are served from local disk; move to S3/object storage for scale.
5. **Weather alerts** — alert types exist; connect a weather API for live regional warnings.
