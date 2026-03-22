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
const MONGODB_RETRY_DELAY_MS = 5000;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
let mongoStatus = "connecting";

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
    database: mongoStatus,
  });
});

app.use("/api/restaurants", restaurantRoutes);
app.use("/api/recommend", recommendRoutes);

mongoose.connection.on("connected", () => {
  mongoStatus = "connected";
  console.log("MongoDB connected");
});

mongoose.connection.on("disconnected", () => {
  mongoStatus = "disconnected";
  console.warn("MongoDB disconnected");
});

mongoose.connection.on("error", (error) => {
  mongoStatus = "error";
  console.error("MongoDB connection error:", error.message);
});

async function connectToDatabase() {
  try {
    mongoStatus = "connecting";
    await mongoose.connect(MONGODB_URI);
  } catch (error) {
    mongoStatus = "error";
    console.error("MongoDB initial connection failed:", error.message);

    setTimeout(() => {
      console.log("Retrying MongoDB connection...");
      connectToDatabase();
    }, MONGODB_RETRY_DELAY_MS);
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectToDatabase();
});
