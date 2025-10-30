require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Use 3000 for HTTP server; 5432 is reserved for PostgreSQL
const PORT = process.env.PORT || 5432;


const CONFIG = require("./APP/Routes/Config");
const SCHEME = require("./APP/Routes/Scheme");


app.use(cors());
app.use(express.json());


app.use("/config", CONFIG);
app.use("/scheme", SCHEME);


app.get("/", (req, res) => {
  const method = req.method;
  console.log(`Received ${method} request at /`);

  res.status(200).json({
    status: "success",
    method,
    message: "API is working",
  });
});


app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});


app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
