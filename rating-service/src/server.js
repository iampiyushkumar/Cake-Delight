require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db.js");

const PORT = process.env.PORT || 3003;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Rating Service running on port ${PORT}`);
  });
});