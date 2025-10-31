const nano = require("./Scheme/Utils/Relax/Utils/nano");

class ImageService {
  constructor() {
    this.dbName = "item_images";
    this.db = nano.db.use(this.dbName);
    this.initDB();
  }

  async initDB() {
    try {
      await nano.db.create(this.dbName);
    } catch (error) {
      // DB already exists
    }
  }

  async saveImage(itemId, imageBuffer, contentType) {
    const docId = `item_${itemId}`;
    try {
      const doc = await this.db.insert({
        _id: docId,
        item_id: itemId,
        created_at: new Date().toISOString()
      });
      
      await this.db.attachment.insert(docId, "image", imageBuffer, contentType, { rev: doc.rev });
      return { success: true, docId };
    } catch (error) {
      throw new Error(`Failed to save image: ${error.message}`);
    }
  }

  async getImage(itemId) {
    const docId = `item_${itemId}`;
    try {
      return await this.db.attachment.get(docId, "image");
    } catch (error) {
      throw new Error(`Image not found: ${error.message}`);
    }
  }

  async deleteImage(itemId) {
    const docId = `item_${itemId}`;
    try {
      const doc = await this.db.get(docId);
      await this.db.destroy(docId, doc._rev);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }
}

module.exports = new ImageService();