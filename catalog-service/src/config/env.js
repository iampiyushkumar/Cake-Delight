const dotenv = require("dotenv");

dotenv.config();

const requiredVariables = [
  "PORT",
  "NODE_ENV",
  "MONGODB_URI",
];

requiredVariables.forEach((variable) => {
  if (!process.env[variable]) {
    throw new Error(
      `Missing required environment variable: ${variable}`
    );
  }
});

const config = {
  port: parseInt(process.env.PORT, 10) || 3001,

  nodeEnv: process.env.NODE_ENV,

  mongodb: {
    uri: process.env.MONGODB_URI,
  },
};

module.exports = config;