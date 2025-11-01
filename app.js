require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 5432;

const CONFIG = require("./APP/Routes/Config");
const SCHEME = require("./APP/Routes/Scheme");
const AUTH = require("./APP/Routes/auth");
const UPLOAD = require("./APP/Routes/upload");


app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/upload", UPLOAD);
app.use("/config", CONFIG);
app.use("/scheme", SCHEME);
app.use("/api", AUTH);


app.get("/", (req, res) => {
  const method = req.method;
  console.log(`Received ${method} request at /`);

  res.status(200).json({
    status: "success",
    method: method,
    message: "API is working"
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT,  () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});