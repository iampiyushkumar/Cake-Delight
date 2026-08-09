const mongoose = require("mongoose");

const config = require("./env");

/**
 * Connect to MongoDB
 */


const connectDatabase = async () => {
  try {
    await mongoose.connect(config.mongodb.uri);

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};


module.exports = {
  connectDatabase
};