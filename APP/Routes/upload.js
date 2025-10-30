const express = require('express');
const router = express.Router();
const uploadController = require('../Controller/uploadController');
const { authenticate } = require('../Middleware/Auth/authenticate');
const upload = require('../Middleware/Multer/uploadConfig');

// Upload routes
router.post(
  '/organization-photo',
  upload.single('photo'),
  uploadController.uploadOrganizationPhoto
);

router.post(
  '/profile-picture',
  authenticate,
  upload.single('photo'),
  uploadController.uploadProfilePicture
);

// Get image
router.get('/image/:imageId/:filename', uploadController.getImage);

// Delete image (protected)
router.delete('/image/:imageId', authenticate, uploadController.deleteImage);

module.exports = router;