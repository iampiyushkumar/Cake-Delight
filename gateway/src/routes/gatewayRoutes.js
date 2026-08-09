const {createProxyMiddleware } = require('http-proxy-middleware');

const setupGatewayRoutes = (app) => {
  const catalogUrl = process.env.CATALOG_SERVICE_URL || 'http://localhost:3001';
  const orderUrl = process.env.ORDER_SERVICE_URL || 'http://localhost:3002';
  const ratingUrl = process.env.RATING_SERVICE_URL || 'http://localhost:3003';
  const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004';

  // Catalog Routing
  app.use(
    '/catalog',
    createProxyMiddleware({
      target: catalogUrl,
      changeOrigin: true,
      pathRewrite: { '^/catalog': '' }
    })
  );

  // Order & Basket Routing
  app.use(
    '/orders',
    createProxyMiddleware({
      target: orderUrl,
      changeOrigin: true,
      pathRewrite: { '^/orders': '' }
    })
  );

  // Rating Routing
  app.use(
    '/ratings',
    createProxyMiddleware({
      target: ratingUrl,
      changeOrigin: true,
      pathRewrite: { '^/ratings': '' }
    })
  );

  // Notification Routing
  app.use(
    '/notifications',
    createProxyMiddleware({
      target: notificationUrl,
      changeOrigin: true,
      pathRewrite: { '^/notifications': '' }
    })
  );
};

module.exports = setupGatewayRoutes;