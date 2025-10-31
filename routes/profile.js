const express = require('express');
const router = express.Router();

// GET /profile - Get user profile
router.get('/', (req, res) => {
  res.json({ message: 'Profile endpoint' });
});

// GET /profile/settings - Get profile settings
router.get('/settings', (req, res) => {
  res.json({ message: 'Profile settings endpoint' });
});

module.exports = router;
