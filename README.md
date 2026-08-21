# Financy

Aplicação fullstack de gerenciamento de finanças com GraphQL.

## Estrutura

- `backend/` — API GraphQL (Yoga + Prisma + PostgreSQL/Neon + JWT)
- `frontend/` — Frontend React (Vite + Apollo Client + Tailwind)

## Backend

```bash
cd backend
cp .env.example .env
# Preencha JWT_SECRET, DATABASE_URL (Neon Postgres) e CORS_ORIGIN
npm install
npx prisma migrate dev
npm run dev
```

API em `http://localhost:4000/graphql`

Variáveis (`backend/.env.example`):

```
JWT_SECRET=
DATABASE_URL=
PORT=4000
CORS_ORIGIN=
```

`DATABASE_URL` deve ser a connection string do Neon (`postgresql://...`).
`CORS_ORIGIN` em produção = URL do front na Vercel (ex.: `https://seu-app.vercel.app`).

## Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App em `http://localhost:5173`

Variáveis (`frontend/.env.example`):

```
VITE_BACKEND_URL=
```

Em produção na Vercel: `VITE_BACKEND_URL=https://seu-servico.onrender.com/graphql`
