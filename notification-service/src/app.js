const express = require("express");
const cors = require("cors");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/notifications", notificationRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "notification-service" });
});

module.exports = app;