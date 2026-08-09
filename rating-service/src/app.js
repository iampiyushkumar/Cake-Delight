const express = require("express");
const cors = require("cors");
const ratingRoutes = require("./routes/ratingRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/ratings", ratingRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "rating-service" });
});

module.exports = app;