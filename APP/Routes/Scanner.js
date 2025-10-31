const router = require("express").Router();
const prisma = require("../Controller/Prisma");

// Scan Item by Serial ID or QR Code - Returns asset information for the screen
router.get("/scan/:code", async (req, res) => {
  try {
    const { code } = req.params;

    // Only compare against item_id when the code is a valid UUID. This
    // prevents Prisma from attempting to coerce a non-UUID string into a
    // UUID and throwing an error (e.g. serial codes like "TEST-001").
    const isUuid = (val) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val);

    const where = isUuid(code)
      ? { OR: [{ serial_id: code }, { item_id: code }] }
      : { serial_id: code };

    const item = await prisma.item.findFirst({
      where,
      include: { user: true, organization: true, vendor: true }
    });

    if (!item) return res.status(404).json({ error: "Item not found" });

    const response = {
      item_id: item.item_id,
      serial_id: item.serial_id,
      item_name: item.item_name,
      borrow_status: item.status,
      condition: item.condition,
      assigned_to: item.assigned_to,
      image_url: `/api/items/${item.item_id}/image`,
      user: item.user,
      organization: item.organization,
      vendor: item.vendor
    };

    res.json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Borrow Asset
router.post("/borrow", async (req, res) => {
  try {
    const { item_id, user_id, due_date } = req.body;
    
    await prisma.item.update({
      where: { item_id },
      data: { assigned_to: user_id, status: "borrowed" }
    });
    
    await prisma.scan_history.create({
      data: { user_id, item_name: req.body.item_name, serial_id: req.body.serial_id, due_date, status: "borrowed" }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Return Asset
router.post("/return", async (req, res) => {
  try {
    const { item_id, user_id, condition_on_return, reason } = req.body;
    
    await prisma.item.update({
      where: { item_id },
      data: { assigned_to: null, status: "available" }
    });
    
    await prisma.Renamedreturn.create({
      data: { asset_id: item_id, user_id, condition_on_return, reason }
    });
    
    await prisma.scan_history.create({
      data: { user_id, item_name: req.body.item_name, serial_id: req.body.serial_id, status: "returned" }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Record scan history
router.post("/history", async (req, res) => {
  try {
    const { user_id, org_id, serial_id, item_name, status } = req.body;
    const history = await prisma.scan_history.create({
      data: { user_id, org_id, serial_id, item_name, status }
    });
    res.json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;