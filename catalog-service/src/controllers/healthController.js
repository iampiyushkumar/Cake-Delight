/**
 * GET /health
 * Returns the health status of the Catalog Service.
 */
const healthCheck = (req, res) => {
  return res.status(200).json({
    status: "UP",
    service: "catalog-service",
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  healthCheck,
};