const express = require("express");
const nano = require("nano")(process.env.COUCHDBURL);
const router = express.Router();

const db = nano.db.use("requests"); // Ensure this DB exists

// 🔍 Get all requests (with optional search)
router.get("/", async (req, res) => {
  const { q } = req.query;

  try {
    const result = await db.list({ include_docs: true });
    let requests = result.rows.map((row) => row.doc);

    if (q) {
      const query = q.toLowerCase();
      requests = requests.filter((r) =>
        r.name?.toLowerCase().includes(query) ||
        r.serial?.toLowerCase().includes(query) ||
        r.requester?.toLowerCase().includes(query)
      );
    }

    res.json(requests);
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

// 🆕 Create a new request
router.post("/", async (req, res) => {
  const { serial, name, requester, date } = req.body;

  if (!serial || !name || !requester || !date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newRequest = {
      serial,
      name,
      requester,
      date,
      status: null,
      createdAt: new Date().toISOString(),
    };

    const response = await db.insert(newRequest);
    res.json({ message: "Request created", id: response.id });
  } catch (err) {
    console.error("Error creating request:", err);
    res.status(500).json({ error: "Failed to create request" });
  }
});

// ✅ Update request status
router.patch("/:id", async (req, res) => {
  const { status } = req.body;

  if (!["APPROVED", "DECLINED", null].includes(status)) {
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
