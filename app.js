require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Use 3000 for HTTP server; 5432 is reserved for PostgreSQL
const PORT = process.env.PORT || 5432;

// Route imports
const CONFIG = require("./APP/Routes/Config");
const SCHEME = require("./APP/Routes/Scheme");
const REQUESTS = require("./APP/Routes/Requests");         // ✅ Requests route
const USER_MANAGEMENT = require("./APP/Routes/UserManagement"); // ✅ User Management route

// Middleware
app.use(cors());
app.use(express.json());

// Route bindings
app.use("/config", CONFIG);
app.use("/scheme", SCHEME);
app.use("/requests", REQUESTS);
app.use("/user-management", USER_MANAGEMENT);

// Root route
app.get("/", (req, res) => {
  const method = req.method;
  console.log(`Received ${method} request at /`);

  res.status(200).json({
    status: "success",
    method,
    message: "API is working",
  });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
