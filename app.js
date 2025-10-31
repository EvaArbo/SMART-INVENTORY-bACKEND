require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 5432;

const CONFIG = require("./APP/Routes/Config");
const SCHEME = require("./APP/Routes/Scheme");
const AUTH = require("./APP/Routes/auth");
const PROFILE = require("./routes/profile");
const SECURITY = require("./routes/security");
const NOTIFICATIONS = require("./routes/notifications");
const PRIVACY = require("./routes/privacy");
const TERMS = require("./routes/terms");
const SUPPORT = require("./routes/support");

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