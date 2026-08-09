const express = require("express");
const cakeController = require("../controllers/cakeController");

const router = express.Router();

/**
 * GET /cakes
 * List all cakes
 *
 * Optional Query Parameters:
 * - category
 * - name
 * - minPrice
 * - maxPrice
 */
router.get("/", cakeController.getAllCakes);
router.post("/", cakeController.createCake);

/**
 * GET /cakes/:id
 * Get cake details by ID
 */
router.get("/:id", cakeController.getCakeById);

module.exports = router;