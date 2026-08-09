const express = require("express");

const cakeRoutes = require("./cakeRoutes");
const healthRoutes = require("./healthRoutes");

const router = express.Router();

/**
 * Health Check
 */
router.use("/health", healthRoutes);

/**
 * Cake APIs
 */
router.use("/cakes", cakeRoutes);

module.exports = router;