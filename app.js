require("dotenv").config();
const express = require("express");
const cors = require("cors");


const app = express();

const PORT = process.env.PORT;

const CONFIG = require("./APP/Routes/Config");
const SCHEME = require("./APP/Routes/Scheme");
const USER = require("./APP/Routes/User");

app.use(cors());

app.use(express.json());

// Middleware to parse URL-encoded data
app.use("/config", CONFIG);
app.use("/scheme", SCHEME);
app.use("/user", USER);

app.get("/",function (req, res) {

    let method = req.method;
    console.log(method);

    return res.status(200).json({
        message: "Welcome to sims"});
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});