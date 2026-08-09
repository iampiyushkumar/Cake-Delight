const cakeService = require("../services/cakeService");

/**
 * GET /cakes
 * List all cakes with optional filters.
 */
const getAllCakes = async (req, res, next) => {
  try {
    const filters = {
      category: req.query.category,
      name: req.query.name,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
    };

    const cakes = await cakeService.getAllCakes(filters);

    return res.status(200).json({
      success: true,
      count: cakes.length,
      data: cakes,
    });
  } catch (error) {
    next(error);
  }
};
const createCake = async (req, res, next) => {
    try {
        const cakeData = req.body;
        const newCake = await cakeService.createCake(cakeData); 
      console.log("Request in cake creation controller", req.body);
        return res.status(201).json({
            success: true,
            data: newCake,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /cakes/:id
 * Get a single cake by its ID.
 */
const getCakeById = async (req, res, next) => {
  try {
    const cake = await cakeService.getCakeById(req.params.id);

    return res.status(200).json({
      success: true,
      data: cake,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCakes,
    getCakeById,
    createCake
};