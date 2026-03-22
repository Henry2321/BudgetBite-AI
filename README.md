# BudgetBite AI

Simple Express + Mongoose backend plus a React + Tailwind frontend for a hackathon project.

## Structure

```bash
BudgetBite AI/
  backend/   # Express + Mongoose + OpenAI API
  frontend/  # React + Tailwind + Axios
```

## Files

- `backend/server.js`
- `backend/models/Restaurant.js`
- `backend/routes/restaurantRoutes.js`
- `backend/routes/recommendRoutes.js`
- `backend/services/recommendationService.js`
- `backend/seed.js`
- `backend/data/restaurants.js`
- `backend/.env.example`
- `frontend/src/App.jsx`
- `frontend/src/components/*`

## Backend Run

1. Install dependencies:

```bash
cd backend
npm install
```

Create a local `.env` file from `.env.example` if you want to use OpenAI-powered recommendations.

2. Start MongoDB locally.

Default connection string:

```bash
mongodb://127.0.0.1:27017/budgetbite_ai
```

You can also override it with:

```bash
MONGODB_URI=<your_mongodb_uri>
```

OpenAI integration uses:

```bash
OPENAI_API_KEY=<your_openai_api_key>
OPENAI_MODEL=gpt-5-mini
```

3. Seed sample data:

```bash
npm run seed
```

4. Start the server:

```bash
npm start
```

The backend API will run on:

```bash
http://localhost:5000
```

## Frontend Run

1. Open the frontend app:

```bash
cd frontend
```

2. Install frontend dependencies:

```bash
npm install
```

3. Start the React app:

```bash
npm run dev
```

The frontend will run on:

```bash
http://localhost:5173
```

Optional API override:

```bash
VITE_API_URL=http://localhost:5000
```

## Vercel Deploy

This repository is a monorepo-like structure with:

```bash
backend/
frontend/
```

The root [vercel.json](C:/Users/NGUYEN%20MINH%20TRI/OneDrive/Desktop/BudgetBite%20AI/vercel.json) is configured to deploy the `frontend/` app on Vercel.

Important:

- Set `VITE_API_URL` in Vercel to your deployed backend URL
- Deploy the Express backend separately on a Node-friendly host such as Render, Railway, or similar

## Railway Deploy

Deploy the backend service from the `backend/` directory.

Recommended Railway settings:

- Service `Root Directory`: `/backend`
- Start command: `npm start`
- Healthcheck path: `/health`

The repo includes [backend/railway.json](C:/Users/NGUYEN%20MINH%20TRI/OneDrive/Desktop/BudgetBite%20AI/backend/railway.json) so Railway can pick up the start command and healthcheck automatically once the backend service is pointed at `/backend`.

Required Railway variables:

```bash
MONGODB_URI=<your_mongodb_connection_string>
OPENAI_API_KEY=<your_openai_api_key>
OPENAI_MODEL=gpt-5-mini
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:5173
```

Notes:

- `PORT` is provided automatically by Railway
- If you use MongoDB Atlas or another hosted MongoDB, paste that connection string into `MONGODB_URI`
- After Railway generates a public domain, copy that URL into Vercel as `VITE_API_URL`

## Endpoints

### GET `/api/restaurants?budget=50`

Returns restaurants where `price_min <= budget`, sorted by rating descending.

Optional query:

```bash
GET /api/restaurants?budget=120000&currency=VND
```

### POST `/api/recommend`

Request body:

```json
{
  "budget": 80
}
```

Returns 3 simulated meal suggestions with simple explanations.

When `OPENAI_API_KEY` is set, this endpoint will call OpenAI through the Responses API.
If the key is missing or the request fails, it falls back to the built-in deterministic recommendation logic so the demo still works.

Request body can also include:

```json
{
  "budget": 120000,
  "currency": "VND"
}
```
