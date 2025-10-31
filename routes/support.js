const express = require('express');
const router = express.Router();

// GET /support - Get support information
router.get('/', (req, res) => {
  res.json({ message: 'Support endpoint' });
});

// GET /support/contact - Get contact support
router.get('/contact', (req, res) => {
  res.json({ message: 'Contact support endpoint' });
});

module.exports = router;
