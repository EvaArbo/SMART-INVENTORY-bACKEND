const express = require('express');
const router = express.Router();
const { authenticate } = require('../Middleware/Auth/authenticate');

// POST /support - Submit a support request
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { subject, message, category, priority } = req.body;

    // Validation
    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required'
      });
    }

    // Optional validation for category and priority
    const validCategories = ['technical', 'billing', 'account', 'feature', 'other'];
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Must be one of: technical, billing, account, feature, other'
      });
    }

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority. Must be one of: low, medium, high, urgent'
      });
    }

    // In a real app, save to a support_tickets table
    // For now, just log the request and return a mock ticket ID
    const ticketId = `TICKET-${Date.now()}-${userId}`;
    console.log(`Support request from user ${userId}:`, {
      ticketId,
      subject,
      message,
      category: category || 'other',
      priority: priority || 'medium',
      submittedAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Support request submitted successfully',
      data: {
        ticketId,
        subject,
        category: category || 'other',
        priority: priority || 'medium',
        status: 'open',
        submittedAt: new Date().toISOString(),
        estimatedResponse: '24 hours'
      }
    });
  } catch (error) {
    console.error('Submit support error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting support request',
      error: error.message
    });
  }
});

// GET /support - Retrieve user's support tickets (placeholder)
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    // In a real app, fetch from support_tickets table
    // For now, return empty array
    const tickets = [];

    res.status(200).json({
      success: true,
      message: 'Support tickets retrieved successfully',
      data: tickets
    });
  } catch (error) {
    console.error('Get support tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving support tickets',
      error: error.message
    });
  }
});

module.exports = router;
