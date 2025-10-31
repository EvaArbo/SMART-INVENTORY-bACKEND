const express = require('express');
const router = express.Router();

// GET /terms - Get terms of service
router.get('/', (req, res) => {
  res.json({ message: 'Terms of service endpoint' });
});

// GET /terms/conditions - Get terms and conditions
router.get('/conditions', (req, res) => {
  res.json({ message: 'Terms and conditions endpoint' });
});

module.exports = router;
