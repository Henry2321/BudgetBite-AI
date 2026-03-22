require("dotenv").config();

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

const restaurantRoutes = require("./routes/restaurantRoutes");
const recommendRoutes = require("./routes/recommendRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/budgetbite_ai";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions =
  ALLOWED_ORIGINS.length > 0
    ? {
        origin(origin, callback) {
          if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            return callback(null, true);
          }

          return callback(new Error("Origin not allowed by CORS"));
        },
      }
    : undefined;

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "BudgetBite AI backend is running",
  });
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "budgetbite-ai-backend",
  });
});

app.use("/api/restaurants", restaurantRoutes);
app.use("/api/recommend", recommendRoutes);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  });
