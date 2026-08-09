const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    cakeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Cake ID is required"],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating value is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    userId: {
      type: String,
      trim: true,
      default: "anonymous",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Rating", ratingSchema);