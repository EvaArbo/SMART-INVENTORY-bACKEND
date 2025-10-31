const express = require("express");
const multer = require("multer");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();

const upload = multer({ storage: multer.memoryStorage() });


router.post("/upload-logo/:orgId", upload.single("logo"), async (req, res) => {
  const { orgId } = req.params;
  const file = req.file;

  if (!file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const org = await prisma.organization.findUnique({ where: { org_id: orgId } });

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const updated = await prisma.organization.update({
      where: { org_id: orgId },
      data: {
        org_picture: file.originalname 
      }
    });

    res.json({ message: "Logo uploaded", org_id: updated.org_id });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "Upload failed" });
  }
});


router.get("/:orgId", async (req, res) => {
  try {
    const org = await prisma.organization.findUnique({
      where: { org_id: req.params.orgId }
    });

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    res.json(org);
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch organization" });
  }
});

module.exports = router;
