const express = require('express');
const router = express.Router();

// GET /notifications - Get notifications
router.get('/', (req, res) => {
  res.json({ message: 'Notifications endpoint' });
});

// GET /notifications/settings - Get notification settings
router.get('/settings', (req, res) => {
  res.json({ message: 'Notification settings endpoint' });
});

module.exports = router;
