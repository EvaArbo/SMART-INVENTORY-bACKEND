require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();


const PORT = process.env.PORT;


const CONFIG = require("./APP/Routes/Config");
const SCHEME = require("./APP/Routes/Scheme");
const ITEMS = require("./APP/Routes/Items");
const SCANNER = require("./APP/Routes/Scanner");
const UPLOAD = require("./APP/Routes/Upload");



app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));


app.use("/config", CONFIG);
app.use("/scheme", SCHEME);
app.use("/items", ITEMS);
app.use("/scanner", SCANNER);
app.use("/upload", UPLOAD);



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
