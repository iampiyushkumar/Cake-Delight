const express = require("express");
const cors = require("cors");
const setupGatewayRoutes = require("./routes/gatewayRoutes");

const app = express();
app.use(cors());

// Healthcheck Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'api-gateway' });
});

 setupGatewayRoutes(app);


module.exports = app;