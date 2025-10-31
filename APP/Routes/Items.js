const router = require("express").Router();
const prisma = require("../Controller/Prisma");
const imageService = require("../Controller/ImageService");
const multer = require("multer");

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
    const item = await prisma.item.findFirst({
      where: {
        OR: [
          { serial_id: code },
          { item_id: code }
        ]
      },
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
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { item_name, description, serial_id, location, org_id, vendor_id } = req.body;
    
    const item = await prisma.item.create({
      data: {
        item_name,
        description,
        serial_id,
        location,
        org_id,
        vendor_id,
        status: "available",
        condition: "Good"
      }
    });
    
    if (req.file) {
      await imageService.saveImage(item.item_id, req.file.buffer, req.file.mimetype);
    }
    
    res.json({ success: true, item });
  } catch (error) {
    res.status(400).json({ error: error.message });
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