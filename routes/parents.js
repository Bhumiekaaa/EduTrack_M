const express = require('express');
const { body, validationResult } = require('express-validator');
const Parent = require('../models/Parent');
const User = require('../models/User');
const Student = require('../models/Student');

const router = express.Router();

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'edutrack-jwt-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Get all parents
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'active' } = req.query;
    
    const filter = { status };
    
    const parents = await Parent.find(filter)
      .populate('user', 'firstName lastName email phone dateOfBirth address')
      .populate('students.student', 'studentId grade class section')
      .sort({ parentId: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Parent.countDocuments(filter);
    
    res.json({
      parents,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
    
  } catch (error) {
    console.error('Get parents error:', error);
    res.status(500).json({ error: 'Failed to fetch parents' });
  }
});

// Get parent by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id)
      .populate('user', 'firstName lastName email phone dateOfBirth address')
      .populate('students.student', 'studentId grade class section');
    
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }
    
    res.json(parent);
    
  } catch (error) {
    console.error('Get parent error:', error);
    res.status(500).json({ error: 'Failed to fetch parent' });
  }
});

// Get parent by user ID
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const parent = await Parent.findOne({ user: req.params.userId })
      .populate('user', 'firstName lastName email phone dateOfBirth address')
      .populate('students.student', 'studentId grade class section');
    
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }
    
    res.json(parent);
    
  } catch (error) {
    console.error('Get parent by user error:', error);
    res.status(500).json({ error: 'Failed to fetch parent' });
  }
});

// Update parent profile
router.put('/:id', authenticateToken, [
  body('occupation').optional().trim().isLength({ min: 2, max: 100 }),
  body('workplace.name').optional().trim().isLength({ max: 100 }),
  body('workplace.position').optional().trim().isLength({ max: 100 }),
  body('maritalStatus').optional().isIn(['single', 'married', 'divorced', 'widowed', 'separated']),
  body('status').optional().isIn(['active', 'inactive', 'suspended'])
], async (req, res) => {
  try {
    // TODO: Add authorization check
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    const parent = await Parent.findById(req.params.id);
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }
    
    const { occupation, workplace, maritalStatus, status } = req.body;
    
    if (occupation !== undefined) parent.occupation = occupation;
    if (workplace !== undefined) parent.workplace = { ...parent.workplace, ...workplace };
    if (maritalStatus !== undefined) parent.maritalStatus = maritalStatus;
    if (status !== undefined) parent.status = status;
    
    await parent.save();
    
    const updatedParent = await Parent.findById(req.params.id)
      .populate('user', 'firstName lastName email phone dateOfBirth address');
    
    res.json({
      message: 'Parent profile updated successfully',
      parent: updatedParent
    });
    
  } catch (error) {
    console.error('Update parent error:', error);
    res.status(500).json({ error: 'Failed to update parent profile' });
  }
});

// Add student to parent
router.post('/:id/students', authenticateToken, [
  body('studentId').notEmpty().withMessage('Student ID required'),
  body('relationship').isIn(['mother', 'father', 'guardian', 'grandparent', 'other']).withMessage('Valid relationship required'),
  body('isPrimary').optional().isBoolean(),
  body('emergencyContact').optional().isBoolean()
], async (req, res) => {
  try {
    // TODO: Add authorization check
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    const { studentId, relationship, isPrimary = false, emergencyContact = false } = req.body;
    
    const parent = await Parent.findById(req.params.id);
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }
    
    // Find student by student ID
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    try {
      await parent.addStudent(student._id, relationship, isPrimary, emergencyContact);
      
      const updatedParent = await Parent.findById(req.params.id)
        .populate('user', 'firstName lastName email phone dateOfBirth address')
        .populate('students.student', 'studentId grade class section');
      
      res.json({
        message: 'Student added successfully',
        parent: updatedParent
      });
    } catch (error) {
      res.status(409).json({ error: error.message });
    }
    
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ error: 'Failed to add student' });
  }
});

// Update contact preferences
router.put('/:id/contact-preferences', authenticateToken, [
  body('preferredMethod').optional().isIn(['email', 'phone', 'sms', 'app_notification']),
  body('notificationSettings').optional().isObject(),
  body('communicationLanguage').optional().isLength({ min: 2, max: 5 })
], async (req, res) => {
  try {
    // TODO: Add authorization check
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    const { preferredMethod, notificationSettings, communicationLanguage } = req.body;
    
    const parent = await Parent.findById(req.params.id);
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }
    
    if (preferredMethod !== undefined) {
      parent.contactPreferences.preferredMethod = preferredMethod;
    }
    
    if (notificationSettings !== undefined) {
      parent.contactPreferences.notificationSettings = {
        ...parent.contactPreferences.notificationSettings,
        ...notificationSettings
      };
    }
    
    if (communicationLanguage !== undefined) {
      parent.contactPreferences.communicationLanguage = communicationLanguage;
    }
    
    await parent.save();
    
    res.json({
      message: 'Contact preferences updated successfully',
      contactPreferences: parent.contactPreferences
    });
    
  } catch (error) {
    console.error('Update contact preferences error:', error);
    res.status(500).json({ error: 'Failed to update contact preferences' });
  }
});

// Get parents by student
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const parents = await Parent.findByStudent(req.params.studentId);
    
    res.json({ parents });
    
  } catch (error) {
    console.error('Get parents by student error:', error);
    res.status(500).json({ error: 'Failed to fetch parents by student' });
  }
});

// Get emergency contacts for student
router.get('/emergency-contacts/:studentId', authenticateToken, async (req, res) => {
  try {
    const emergencyContacts = await Parent.findEmergencyContacts(req.params.studentId);
    
    res.json({ emergencyContacts });
    
  } catch (error) {
    console.error('Get emergency contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch emergency contacts' });
  }
});

module.exports = router;
