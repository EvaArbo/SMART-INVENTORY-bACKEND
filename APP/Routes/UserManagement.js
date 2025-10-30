const express = require("express");
const nano = require("nano")(process.env.COUCHDB_URL);
const router = express.Router();

const db = nano.db.use("user_scans"); // Make sure this DB exists

// 🔍 Get all scanned users (with optional search)
router.get("/", async (req, res) => {
  const { q } = req.query;

  try {
    const result = await db.list({ include_docs: true });
    let users = result.rows.map((row) => row.doc);

    if (q) {
      const query = q.toLowerCase();
      users = users.filter((u) =>
        u.name?.toLowerCase().includes(query) ||
        u.serial?.toLowerCase().includes(query)
      );
    }

    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// 🆕 Create a new scan entry
router.post("/", async (req, res) => {
  const { serial, name, date, status, icon } = req.body;

  if (!serial || !name || !date || !status || !icon) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newUser = {
      serial,
      name,
      date,
      status,
      icon,
      createdAt: new Date().toISOString(),
    };

    const response = await db.insert(newUser);
    res.json({ message: "Scan entry created", id: response.id });
  } catch (err) {
    console.error("Error creating scan entry:", err);
    res.status(500).json({ error: "Failed to create scan entry" });
  }
});

// ✅ Update user scan status
router.patch("/:id", async (req, res) => {
  const { status } = req.body;

  if (!["APPROVED", "DENIED", "PENDING"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    const doc = await db.get(req.params.id);
    doc.status = status;
    doc.updatedAt = new Date().toISOString();

    const response = await db.insert(doc);
    res.json({ message: "Status updated", id: response.id });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

module.exports = router;
