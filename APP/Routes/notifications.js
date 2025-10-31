const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../Middleware/Auth/authenticate');
const prisma = new PrismaClient();

// GET /notifications - Retrieve user notification preferences
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    // For now, mock notification preferences since no specific model exists
    // In a real app, this could be stored in a user_preferences or notifications table
    const preferences = {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      orderUpdates: true,
      inventoryAlerts: true,
      securityAlerts: true
    };

    res.status(200).json({
      success: true,
      message: 'Notification preferences retrieved successfully',
      data: preferences
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving notifications',
      error: error.message
    });
  }
});

// PUT /notifications - Update user notification preferences
router.put('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { emailNotifications, pushNotifications, smsNotifications, orderUpdates, inventoryAlerts, securityAlerts } = req.body;

    // For now, just validate and return success since no DB storage is implemented
    // In a real app, update a user_preferences table
    const updatedPreferences = {
      emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
      pushNotifications: pushNotifications !== undefined ? pushNotifications : true,
      smsNotifications: smsNotifications !== undefined ? smsNotifications : false,
      orderUpdates: orderUpdates !== undefined ? orderUpdates : true,
      inventoryAlerts: inventoryAlerts !== undefined ? inventoryAlerts : true,
      securityAlerts: securityAlerts !== undefined ? securityAlerts : true
    };

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: updatedPreferences
    });
  } catch (error) {
    console.error('Update notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating notifications',
      error: error.message
    });
  }
});

module.exports = router;
