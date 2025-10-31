const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../Middleware/Auth/authenticate');
const prisma = new PrismaClient();

// GET /privacy - Retrieve user privacy settings
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    // For now, mock privacy settings since no specific model exists
    // In a real app, this could be stored in a user_privacy or settings table
    const settings = {
      dataSharing: false,
      analyticsTracking: true,
      profileVisibility: 'private', // 'public', 'private', 'organization'
      contactVisibility: false,
      activityLogging: true
    };

    res.status(200).json({
      success: true,
      message: 'Privacy settings retrieved successfully',
      data: settings
    });
  } catch (error) {
    console.error('Get privacy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving privacy settings',
      error: error.message
    });
  }
});

// PUT /privacy - Update user privacy settings
router.put('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { dataSharing, analyticsTracking, profileVisibility, contactVisibility, activityLogging } = req.body;

    // Validate profileVisibility if provided
    if (profileVisibility !== undefined && !['public', 'private', 'organization'].includes(profileVisibility)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid profile visibility. Must be public, private, or organization.'
      });
    }

    // For now, just validate and return success since no DB storage is implemented
    // In a real app, update a user_privacy table
    const updatedSettings = {
      dataSharing: dataSharing !== undefined ? dataSharing : false,
      analyticsTracking: analyticsTracking !== undefined ? analyticsTracking : true,
      profileVisibility: profileVisibility !== undefined ? profileVisibility : 'private',
      contactVisibility: contactVisibility !== undefined ? contactVisibility : false,
      activityLogging: activityLogging !== undefined ? activityLogging : true
    };

    res.status(200).json({
      success: true,
      message: 'Privacy settings updated successfully',
      data: updatedSettings
    });
  } catch (error) {
    console.error('Update privacy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating privacy settings',
      error: error.message
    });
  }
});

module.exports = router;
