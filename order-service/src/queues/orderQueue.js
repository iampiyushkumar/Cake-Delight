const { Queue } = require("bullmq");
const Redis = require("ioredis");

const redisConnection = new Redis({
  host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  maxRetriesPerRequest: null,
});

const orderQueue = new Queue('order-events', { connection: redisConnection });

module.exports = orderQueue;