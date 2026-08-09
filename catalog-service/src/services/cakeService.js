const mongoose = require("mongoose");
const Cake = require("../models/Cake");

/**
 * Get all cakes with optional filters.
 *
 * Supported filters:
 * - category
 * - name
 * - minPrice
 * - maxPrice
 */
const getAllCakes = async (filters = {}) => {
  const query = {};

  // Filter by category
  if (filters.category) {
    query.category = filters.category;
  }

  // Search by cake name (case-insensitive)
  if (filters.name) {
    query.name = {
      $regex: filters.name,
      $options: "i",
    };
  }

  // Price filters
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};

    if (filters.minPrice) {
      query.price.$gte = Number(filters.minPrice);
    }

    if (filters.maxPrice) {
      query.price.$lte = Number(filters.maxPrice);
    }
  }

  const cakes = await Cake.find(query)
    .sort({ createdAt: -1 })
    .lean();

  return cakes;
};

/**
 * Get cake by ID
 */
const getCakeById = async (cakeId) => {
  if (!mongoose.Types.ObjectId.isValid(cakeId)) {
    const error = new Error("Invalid cake ID.");
    error.statusCode = 400;
    throw error;
  }

  const cake = await Cake.findById(cakeId).lean();

  if (!cake) {
    const error = new Error("Cake not found.");
    error.statusCode = 404;
    throw error;
  }

  return cake;
};

const createCake = async (cakeData) => {
    const newCake = new Cake(cakeData);
    await newCake.save();
    return newCake.toObject();
};

module.exports = {
  getAllCakes,
    getCakeById,
    createCake
};