const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

const routes = require("./routes");

const app = express();


app.use(helmet());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(morgan("dev"));


app.use("/", routes);




app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
});
module.exports = app;