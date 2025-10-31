const router = require("express").Router();
const prisma = require("../Controller/Prisma");
const imageService = require("../Controller/ImageService");
const multer = require("multer");
const validateItem = require("../Middleware/validation/itemValidation");

const upload = multer({ storage: multer.memoryStorage() });

// Get all items with image URLs
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    let items = await prisma.item.findMany({
      include: { user: true, organization: true, vendor: true },
      where: search ? {
        OR: [
          { item_name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { serial_id: { contains: search, mode: 'insensitive' } }
        ]
      } : undefined
    });
    
    // Add image URLs
    items = items.map(item => ({
      ...item,
      image_url: `/api/items/${item.item_id}/image`
    }));
    
    res.json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get item by ID or serial/barcode
router.get("/scan/:code", async (req, res) => {
  try {
    const { code } = req.params;

    // Helper to detect UUID format. Prisma will attempt to coerce a value
    // into a UUID for the `item_id` field, which throws when the supplied
    // string is not a valid UUID (e.g. serial like "TEST-001"). Only include
    // the item_id comparison when the code is a valid UUID.
    const isUuid = (val) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val);

    const where = isUuid(code)
      ? { OR: [{ serial_id: code }, { item_id: code }] }
      : { serial_id: code };

    const item = await prisma.item.findFirst({
      where,
      include: { user: true, organization: true, vendor: true }
    });
    
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ ...item, image_url: `/api/items/${item.item_id}/image` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get item by ID
router.get("/:item_id", async (req, res) => {
  try {
    const { item_id } = req.params;
    const item = await prisma.item.findUnique({
      where: { item_id },
      include: { user: true, organization: true, vendor: true }
    });
    
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ ...item, image_url: `/api/items/${item.item_id}/image` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create new item with image
router.post("/", upload.single("image"), validateItem, async (req, res) => {
  try {
    const { 
      item_name,
      org_id,
      serial_id,
      description,
      condition,
      purchase_date,
      assigned_to,
      status,
      location,
      vendor_id 
    } = req.body;
    
    const item = await prisma.item.create({
      data: {
        item_name,
        org_id,
        serial_id,
        description,
        condition,
        purchase_date: new Date(purchase_date),
        assigned_to,
        status,
        location,
        vendor_id,
        item_pic: req.file ? `${req.file.originalname}` : 'default.jpg'
      }
    });
    
    if (req.file) {
      await imageService.saveImage(item.item_id, req.file.buffer, req.file.mimetype);
    }
    
    res.json({ success: true, item });
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Serial ID must be unique' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// Get item image
router.get("/:item_id/image", async (req, res) => {
  try {
    const { item_id } = req.params;
    const imageBuffer = await imageService.getImage(item_id);
    res.set("Content-Type", "image/jpeg");
    res.send(imageBuffer);
  } catch (error) {
    res.status(404).json({ error: "Image not found" });
  }
});

// Update item
router.put("/:item_id", upload.single("image"), async (req, res) => {
  try {
    const { item_id } = req.params;
    const item = await prisma.item.update({
      where: { item_id },
      data: req.body
    });
    
    if (req.file) {
      await imageService.saveImage(item_id, req.file.buffer, req.file.mimetype);
    }
    
    res.json({ ...item, image_url: `/api/items/${item.item_id}/image` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete item
router.delete("/:item_id", async (req, res) => {
  try {
    const { item_id } = req.params;
    await imageService.deleteImage(item_id).catch(() => {}); // Ignore if no image
    await prisma.item.delete({ where: { item_id } });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;