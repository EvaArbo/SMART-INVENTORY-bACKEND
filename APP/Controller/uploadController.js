const nano = require('nano');
const fs = require('fs');
const path = require('path');

// Initialize CouchDB connection
const couchdb = nano(process.env.COUCHDB_URL);

// Database names
const IMAGES_DB = 'images';

// Ensure database exists
const ensureDatabase = async (dbName) => {
  try {
    await couchdb.db.get(dbName);
  } catch (error) {
    if (error.statusCode === 404) {
      await couchdb.db.create(dbName);
      console.log(`Database ${dbName} created`);
    } else {
      throw error;
    }
  }
};

// Initialize databases
(async () => {
  try {
    await ensureDatabase(IMAGES_DB);
  } catch (error) {
    console.error('Error initializing CouchDB:', error);
  }
})();

// Upload organization photo
exports.uploadOrganizationPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const db = couchdb.use(IMAGES_DB);

    // Read file data
    const fileBuffer = fs.readFileSync(req.file.path);
    const base64Image = fileBuffer.toString('base64');

    // Create document with metadata
    const doc = {
      type: 'organization_photo',
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: req.user ? req.user.userId : null
    };

    // Insert document
    const response = await db.insert(doc);

    // Attach image to document
    await db.attachment.insert(
      response.id,
      req.file.filename,
      base64Image,
      req.file.mimetype,
      { rev: response.rev }
    );

    // Delete temporary file
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: 'Organization photo uploaded successfully',
      data: {
        imageId: response.id,
        filename: req.file.filename,
        url: `/api/upload/image/${response.id}/${req.file.filename}`
      }
    });

  } catch (error) {
    console.error('Upload organization photo error:', error);
    
    // Clean up file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Server error during photo upload',
      error: error.message
    });
  }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const db = couchdb.use(IMAGES_DB);

    // Read file data
    const fileBuffer = fs.readFileSync(req.file.path);
    const base64Image = fileBuffer.toString('base64');

    // Create document with metadata
    const doc = {
      type: 'profile_picture',
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: req.user ? req.user.userId : null
    };

    // Insert document
    const response = await db.insert(doc);

    // Attach image to document
    await db.attachment.insert(
      response.id,
      req.file.filename,
      base64Image,
      req.file.mimetype,
      { rev: response.rev }
    );

    // Delete temporary file
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        imageId: response.id,
        filename: req.file.filename,
        url: `/api/upload/image/${response.id}/${req.file.filename}`
      }
    });

  } catch (error) {
    console.error('Upload profile picture error:', error);
    
    // Clean up file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Server error during photo upload',
      error: error.message
    });
  }
};

// Get image from CouchDB
exports.getImage = async (req, res) => {
  try {
    const { imageId, filename } = req.params;

    const db = couchdb.use(IMAGES_DB);

    // Get attachment
    const imageBuffer = await db.attachment.get(imageId, filename);

    // Get document to get mimetype
    const doc = await db.get(imageId);

    res.set('Content-Type', doc.mimetype);
    res.send(imageBuffer);

  } catch (error) {
    console.error('Get image error:', error);

    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error retrieving image',
      error: error.message
    });
  }
};

// Delete image
exports.deleteImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const db = couchdb.use(IMAGES_DB);

    // Get document
    const doc = await db.get(imageId);

    // Delete document (and all attachments)
    await db.destroy(imageId, doc._rev);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete image error:', error);

    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error deleting image',
      error: error.message
    });
  }
};