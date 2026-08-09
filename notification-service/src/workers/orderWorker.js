const { Worker } = require("bullmq");
const notificationService = require("../services/notificationService");

const startOrderWorker = () => {
  const redisOptions = {
    host: process.env.REDIS_HOST || "redis",
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    maxRetriesPerRequest: null,
  };

  const worker = new Worker(
    "order-events",
    async (job) => {
      console.log(`[Worker] Received job: ${job.name} (ID: ${job.id})`);

      if (job.name === "ORDER_CREATED") {
        await notificationService.sendOrderConfirmation(job.data);
      } else {
        console.log(`[Worker] Ignored event type: ${job.name}`);
      }
    },
    { connection: redisOptions }
  );

  worker.on("completed", (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed with error: ${err.message}`);
  });

  console.log("Notification Worker started and listening for 'order-events'...");
};

module.exports = startOrderWorker;