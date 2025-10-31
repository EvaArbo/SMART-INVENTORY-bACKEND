require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;

const CONFIG = require("./APP/Routes/Config");
const SCHEME = require("./APP/Routes/Scheme");
const AUTH = require("./APP/Routes/auth");
const PROFILE = require("./APP/Routes/profile");
const SECURITY = require("./APP/Routes/security");
const NOTIFICATIONS = require("./APP/Routes/notifications");
const PRIVACY = require("./APP/Routes/privacy");
const TERMS = require("./APP/Routes/terms");
const SUPPORT = require("./APP/Routes/support");

app.use(cors());
app.use(express.json());

app.use("/config", CONFIG);
app.use("/scheme", SCHEME);
app.use("/api", AUTH);
app.use("/profile", PROFILE);
app.use("/security", SECURITY);
app.use("/notifications", NOTIFICATIONS);
app.use("/privacy", PRIVACY);
app.use("/terms", TERMS);
app.use("/support", SUPPORT);

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
