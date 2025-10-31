const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();

const prisma = new PrismaClient();


router.get("/", async (req, res) => {
  const { q } = req.query;

  try {
    const scans = await prisma.scan_history.findMany({
      where: q
        ? {
            OR: [
              { item_name: { contains: q, mode: "insensitive" } },
              { serial_id: { contains: q, mode: "insensitive" } }
            ]
          }
        : undefined
    });

    res.json(scans);
  } catch (err) {
    console.error("Error fetching scan entries:", err.message);
    res.status(500).json({ error: "Failed to fetch scan entries" });
  }
});


router.post("/", async (req, res) => {
  const {
    serial_id,
    item_name,
    user_id,
    org_id,
    scanned_at,
    due_date,
    status
  } = req.body;

  if (
    !serial_id ||
    !item_name ||
    !user_id ||
    !org_id ||
    !scanned_at ||
    !due_date ||
    !status
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newScan = await prisma.scan_history.create({
      data: {
        serial_id,
        item_name,
        user_id,
        org_id,
        scanned_at: new Date(scanned_at),
        due_date: new Date(due_date),
        status: status.toUpperCase()
      }
    });

    res.status(201).json({ message: "Scan entry created", id: newScan.id });
  } catch (err) {
    console.error("Error creating scan entry:", err.message);
    res.status(500).json({ error: "Failed to create scan entry" });
  }
});


router.patch("/:id", async (req, res) => {
  const { status } = req.body;

  if (!["APPROVED", "DENIED", "PENDING"].includes(status?.toUpperCase())) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    const updated = await prisma.scan_history.update({
      where: { id: req.params.id },
      data: {
        status: status.toUpperCase(),
        updatedAt: new Date()
      }
    });

    res.json({ message: "Status updated", id: updated.id });
  } catch (err) {
    console.error("Error updating status:", err.message);
    res.status(500).json({ error: "Failed to update status" });
  }
});

module.exports = router;
