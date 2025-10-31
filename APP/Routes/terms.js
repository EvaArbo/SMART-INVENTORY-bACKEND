const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../Middleware/Auth/authenticate');
const prisma = new PrismaClient();

// GET /terms - Retrieve terms of service
router.get('/', (req, res) => {
  try {
    // Static terms content - in a real app, this could be stored in DB or file
    const termsContent = {
      version: '1.0',
      lastUpdated: '2024-01-01',
      content: `
        Terms of Service for Smart Inventory Backend

        1. Acceptance of Terms
        By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement.

        2. Use License
        Permission is granted to temporarily use this service for personal, non-commercial transitory viewing only.

        3. Disclaimer
        The materials on this service are provided on an 'as is' basis. This service makes no warranties, expressed or implied.

        4. Limitations
        In no event shall this service or its suppliers be liable for any damages arising out of the use or inability to use this service.

        5. Privacy Policy
        Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service.

        6. Governing Law
        These terms and conditions are governed by and construed in accordance with the laws of your jurisdiction.
      `,
      acceptedVersions: ['1.0']
    };

    res.status(200).json({
      success: true,
      message: 'Terms of service retrieved successfully',
      data: termsContent
    });
  } catch (error) {
    console.error('Get terms error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving terms',
      error: error.message
    });
  }
});

// POST /terms/accept - Accept terms of service
router.post('/accept', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { version } = req.body;

    if (!version) {
      return res.status(400).json({
        success: false,
        message: 'Terms version is required'
      });
    }

    // In a real app, store acceptance in a user_terms_acceptance table
    // For now, just log and return success
    console.log(`User ${userId} accepted terms version ${version}`);

    res.status(200).json({
      success: true,
      message: 'Terms accepted successfully',
      data: {
        acceptedVersion: version,
        acceptedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Accept terms error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error accepting terms',
      error: error.message
    });
  }
});

module.exports = router;
