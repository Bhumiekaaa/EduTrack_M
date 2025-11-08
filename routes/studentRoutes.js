const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const {
  getDashboardData,
  getAttendance,
  getAssignments,
  submitAssignment,
  getResults,
  getSchedule
} = require('../controllers/studentController');

// All routes are protected and require student role
router.use(auth, requireRole('student'));

// Dashboard
router.get('/dashboard', getDashboardData);

// Attendance
router.get('/attendance', getAttendance);

// Assignments
router.get('/assignments', getAssignments);
router.post('/assignments/:id/submit', submitAssignment);

// Results
router.get('/results', getResults);

// Schedule
router.get('/schedule', getSchedule);

module.exports = router;
