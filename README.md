## PropFlow backend

### Requirements
- Node.js (18+ recommended)
- MongoDB (local or hosted)

### Setup
1) Create `.env` from `.env.example`
2) Install deps:

```bash
npm install
```

### Run

```bash
npm run dev
```

Health check: `GET /health`
Swagger UI: `GET /docs`
OpenAPI JSON: `GET /openapi.json`

### Seed demo data

```bash
npm run seed
```

Seed creates demo Admin, Agent, and Client accounts plus properties, bookings, and CRM notes.
Default password for seeded users: `password123`

