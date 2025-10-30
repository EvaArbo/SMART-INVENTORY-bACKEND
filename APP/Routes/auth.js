const express = require('express');
const router = express.Router();
const authController = require('../Controller/authController');
console.log('authController:', authController);  // ADD THIS
console.log('authController.signup:', authController.signup);  // ADD THIS
const { authenticate } = require('../Middleware/Auth/authenticate');

// Public routes
router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/refresh-token', authController.refreshToken);

// Protected routes (require authentication)
router.get('/verify', authenticate, authController.verifyToken);
router.post('/logout', authenticate, authController.logout);

module.exports = router;

