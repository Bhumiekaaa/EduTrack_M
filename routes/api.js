const express = require('express');
const router = express.Router();

// Import route files
const authRoutes = require('./authRoutes');
const studentRoutes = require('./studentRoutes');

// Route files
router.use('/auth', authRoutes);
router.use('/api/students', studentRoutes);

module.exports = router;
