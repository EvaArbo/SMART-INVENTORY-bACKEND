require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 4050;


const CONFIG = require("./APP/Routes/Config");
const SCHEME = require("./APP/Routes/Scheme");
const REQUESTS = require("./APP/Routes/Requests"); 
const USER_MANAGEMENT = require("./APP/Routes/UserManagement");


app.use(cors());
app.use(express.json());


app.use("/config", CONFIG);
app.use("/scheme", SCHEME);
app.use("/requests", REQUESTS); 
app.use("/user-management", USER_MANAGEMENT);

oute
app.get("/", (req, res) => {
  console.log(`✅ ${req.method} request received at /`);
  res.status(200).json({
    status: "success",
    message: "Smart Inventory Backend is running 🚀",
  });
});


app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});


app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
