const app = require("./app");
const config = require("./config/env");
const { connectDatabase, disconnectDatabase } = require("./config/db");

let server;

/**
 * Start the application
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

   server=app.listen(config.port, () => {
      console.log(
        `Catalog Service is running on port ${config.port} in ${config.nodeEnv} mode.`
      );
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
};


// Start the application
startServer();