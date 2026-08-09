const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/ratingController");

// Create rating
router.post("/", ratingController.createRating);

// Get all ratings for a cake
router.get("/:cakeId", ratingController.getRatingsByCakeId);

// Get average rating for a cake
router.get("/:cakeId/average", ratingController.getAverageRating);

module.exports = router;