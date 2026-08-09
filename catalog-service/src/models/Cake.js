const mongoose = require("mongoose");

const cakeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Cake name is required"],
      trim: true,
      minlength: [2, "Cake name must be at least 2 characters"],
      maxlength: [100, "Cake name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      enum: [
        "Birthday",
        "Wedding",
        "Anniversary",
        "Chocolate",
        "Eggless",
        "Cupcake",
        "Fruit",
        "Designer",
        "Kids",
        "Premium",
      ],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    availability: {
      type: Boolean,
      default: true,
    },

    image: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


module.exports = mongoose.model("Cake", cakeSchema);