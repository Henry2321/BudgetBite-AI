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

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "BudgetBite AI backend is running",
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
