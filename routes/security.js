const express = require('express');
const router = express.Router();

// GET /security - Get security settings
router.get('/', (req, res) => {
  res.json({ message: 'Security endpoint' });
});

// GET /security/password - Get password settings
router.get('/password', (req, res) => {
  res.json({ message: 'Password settings endpoint' });
});

module.exports = router;
