const express = require('express');
const router = express.Router();

// GET /privacy - Get privacy settings
router.get('/', (req, res) => {
  res.json({ message: 'Privacy endpoint' });
});

// GET /privacy/policy - Get privacy policy
router.get('/policy', (req, res) => {
  res.json({ message: 'Privacy policy endpoint' });
});

module.exports = router;
