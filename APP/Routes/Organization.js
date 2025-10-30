const express = require("express");
const multer = require("multer");
const nano = require("nano")(process.env.COUCHDBURL);
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });
const db = nano.db.use(process.env.COUCHDB_DB);

// Upload logo
router.post("/upload-logo/:orgId", upload.single("logo"), async (req, res) => {
  const { orgId } = req.params;
  const file = req.file;

  if (!file) return res.status(400).json({ error: "No file uploaded" });

  try {
    let doc;
    try {
      doc = await db.get(orgId);
    } catch {
      doc = await db.insert({ _id: orgId });
    }

    const rev = doc._rev || (await db.get(orgId))._rev;

    await db.attachment.insert(
      orgId,
      file.originalname,
      file.buffer,
      file.mimetype,
      { rev }
    );

    res.json({ message: "Logo uploaded", id: orgId });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Get organization details
router.get("/:orgId", async (req, res) => {
  try {
    const doc = await db.get(req.params.orgId);
    res.json(doc);
  } catch (err) {
    res.status(404).json({ error: "Organization not found" });
  }
});

module.exports = router;
