const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();


router.get("/", async (req, res) => {
  const { q } = req.query;

  try {
    let requests = await prisma.request.findMany();

    if (q) {
      const query = q.toLowerCase();
      requests = requests.filter((r) =>
        r.item_name?.toLowerCase().includes(query) ||
        r.request_id?.toLowerCase().includes(query) ||
        r.status?.toLowerCase().includes(query)
      );
    }

    res.json(requests);
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});


router.post("/", async (req, res) => {
  try {
    const {
      user_id,
      org_id,
      item_name,
      item_id,
      request_date,
      due_date,
      status,
    } = req.body;

   
    if (!user_id || !org_id || !item_name || !item_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

   
    const safeDate = (d) => (d && !isNaN(new Date(d)) ? new Date(d) : undefined);

    const newRequest = await prisma.request.create({
      data: {
        user_id,
        org_id,
        item_name,
        item_id,
        request_date: safeDate(request_date),
        due_date: safeDate(due_date),
        status,
      },
    });

    res.status(201).json({
      message: "Request created successfully",
      data: newRequest,
    });
  } catch (err) {
    console.error("Error creating request:", err);
    res.status(500).json({ error: "Failed to create request" });
  }
});


router.patch("/:request_id", async (req, res) => {
  const { status } = req.body;

  try {
    const updated = await prisma.request.update({
      where: { request_id: req.params.request_id },
      data: {
        status,
      },
    });

    res.json({ message: "Status updated", data: updated });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

module.exports = router;
