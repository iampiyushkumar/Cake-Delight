const Rating = require("../models/Rating");

// POST /ratings
exports.createRating = async (req, res) => {
  try {
    const { cakeId, rating, comment, userId } = req.body;

    if (!cakeId || !rating) {
      return res.status(400).json({ message: "cakeId and rating are required." });
    }

    const newRating = await Rating.create({
      cakeId,
      rating,
      comment,
      userId,
    });

    return res.status(201).json({
      success: true,
      data: newRating,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /ratings/:cakeId
exports.getRatingsByCakeId = async (req, res) => {
  try {
    const { cakeId } = req.params;

    const ratings = await Rating.find({ cakeId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: ratings.length,
      data: ratings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /ratings/:cakeId/average
exports.getAverageRating = async (req, res) => {
  try {
    const { cakeId } = req.params;

    const mongoose = require("mongoose");
    
    const stats = await Rating.aggregate([
      { $match: { cakeId: new mongoose.Types.ObjectId(cakeId) } },
      {
        $group: {
          _id: "$cakeId",
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    if (stats.length === 0) {
      return res.status(200).json({
        success: true,
        cakeId,
        averageRating: 0,
        totalRatings: 0,
      });
    }

    return res.status(200).json({
      success: true,
      cakeId,
      averageRating: parseFloat(stats[0].averageRating.toFixed(2)),
      totalRatings: stats[0].totalRatings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};