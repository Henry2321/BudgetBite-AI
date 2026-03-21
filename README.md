# BudgetBite AI

Simple Express + Mongoose backend plus a React + Tailwind frontend for a hackathon project.

## Files

- `server.js`
- `models/Restaurant.js`
- `routes/restaurantRoutes.js`
- `routes/recommendRoutes.js`
- `seed.js`
- `data/restaurants.js`
- `client/src/App.jsx`
- `client/src/components/*`

## Backend Run

1. Install dependencies:

```bash
npm install
```

2. Start MongoDB locally.

Default connection string:

```bash
mongodb://127.0.0.1:27017/budgetbite_ai
```

You can also override it with:

```bash
MONGODB_URI=<your_mongodb_uri>
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

1. Open the client app:

```bash
cd client
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

Request body can also include:

```json
{
  "budget": 120000,
  "currency": "VND"
}
```
