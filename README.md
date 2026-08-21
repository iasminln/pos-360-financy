# Atividade desenvolvida para Pós Gradução Full Stack da Rocketseat

📌 Essa atividade foi publicada e pode ser visualizada em: [financy.iasmin.dev](https://financy.iasmin.dev/).

**Dados de teste:**</br>
**E-mail:** `teste@teste.com`</br>
**Senha:** `admin123`</br>

</br>

**Stack de publicação:**</br>
**Frontend:** Vercel</br>
**Backend:** Render</br>
**Banco de dados:** Neon</br>

</br>



# Financy

Aplicação fullstack de gerenciamento de finanças com GraphQL.

## Estrutura

- `backend/` — API GraphQL (Yoga + Prisma + SQLite + JWT)
- `frontend/` — Frontend React (Vite + Apollo Client + Tailwind)

## Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

API em `http://localhost:4000/graphql`

Variáveis (`backend/.env.example`):

```
JWT_SECRET=
DATABASE_URL="file:./dev.db"
PORT=4000
CORS_ORIGIN=*
```

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
