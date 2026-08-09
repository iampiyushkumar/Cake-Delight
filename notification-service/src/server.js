require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const startOrderWorker = require("./workers/orderWorker");

const PORT = process.env.PORT || 3004;

const startServer = async () => {
  await connectDB();

  // Start BullMQ Worker
  startOrderWorker();

  app.listen(PORT, () => {
    console.log(`Notification Service running on port ${PORT}`);
  });
};

startServer();