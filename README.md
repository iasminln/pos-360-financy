# Financy

Aplicação fullstack de gerenciamento de finanças com GraphQL.

## Estrutura

- `server/` — API GraphQL (Yoga + Prisma + SQLite + JWT)
- `web/` — Frontend React (Vite + Apollo Client + Tailwind)

## Backend

```bash
cd server
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

API em `http://localhost:4000/graphql`

Variáveis (`server/.env.example`):

```
JWT_SECRET=
DATABASE_URL="file:./dev.db"
PORT=4000
CORS_ORIGIN=*
```

## Frontend

```bash
cd web
cp .env.example .env
npm install
npm run dev
```

App em `http://localhost:5173`

Variáveis (`web/.env.example`):

```
VITE_BACKEND_URL=
```
