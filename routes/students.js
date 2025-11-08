const express = require('express');
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');
const User = require('../models/User');

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

// Get all students
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, grade, academicYear, status = 'active' } = req.query;
    
    const filter = { status };
    
    if (grade) {
      filter.grade = grade;
    }
    
    if (academicYear) {
      filter.academicYear = academicYear;
    }
    
    const students = await Student.find(filter)
      .populate('user', 'firstName lastName email phone dateOfBirth address')
      .populate('parents.parent', 'firstName lastName email phone')
      .sort({ studentId: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Student.countDocuments(filter);
    
    res.json({
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
    
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Get student by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'firstName lastName email phone dateOfBirth address')
      .populate('parents.parent', 'firstName lastName email phone occupation');
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(student);
    
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// Get student by user ID
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.params.userId })
      .populate('user', 'firstName lastName email phone dateOfBirth address')
      .populate('parents.parent', 'firstName lastName email phone occupation');
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(student);
    
  } catch (error) {
    console.error('Get student by user error:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// Update student profile
router.put('/:id', authenticateToken, [
  body('grade').optional().isIn(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']),
  body('class').optional().trim().isLength({ max: 50 }),
  body('section').optional().trim().isLength({ max: 50 }),
  body('academicYear').optional().trim().isLength({ max: 10 }),
  body('status').optional().isIn(['active', 'inactive', 'graduated', 'transferred', 'suspended'])
], async (req, res) => {
  try {
    // TODO: Add authorization check (student can update own profile, teachers/admins can update any)
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const { grade, class: studentClass, section, academicYear, status } = req.body;
    
    if (grade !== undefined) student.grade = grade;
    if (studentClass !== undefined) student.class = studentClass;
    if (section !== undefined) student.section = section;
    if (academicYear !== undefined) student.academicYear = academicYear;
    if (status !== undefined) student.status = status;
    
    await student.save();
    
    const updatedStudent = await Student.findById(req.params.id)
      .populate('user', 'firstName lastName email phone dateOfBirth address');
    
    res.json({
      message: 'Student profile updated successfully',
      student: updatedStudent
    });
    
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Failed to update student profile' });
  }
});

// Add parent to student
router.post('/:id/parents', authenticateToken, [
  body('parentId').notEmpty().withMessage('Parent ID required'),
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
    
    const { parentId, relationship, isPrimary = false, emergencyContact = false } = req.body;
    
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Check if parent already exists
    const existingParent = student.parents.find(parent => parent.parent.toString() === parentId);
    if (existingParent) {
      return res.status(409).json({ error: 'Parent already associated with this student' });
    }
    
    student.parents.push({
      parent: parentId,
      relationship,
      isPrimary,
      emergencyContact
    });
    
    await student.save();
    
    const updatedStudent = await Student.findById(req.params.id)
      .populate('user', 'firstName lastName email phone dateOfBirth address')
      .populate('parents.parent', 'firstName lastName email phone occupation');
    
    res.json({
      message: 'Parent added successfully',
      student: updatedStudent
    });
    
  } catch (error) {
    console.error('Add parent error:', error);
    res.status(500).json({ error: 'Failed to add parent' });
  }
});

// Update medical information
router.put('/:id/medical', authenticateToken, [
  body('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  body('allergies').optional().isArray(),
  body('medications').optional().isArray(),
  body('medicalConditions').optional().isArray(),
  body('emergencyInstructions').optional().trim().isLength({ max: 500 })
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
    
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const { bloodGroup, allergies, medications, medicalConditions, emergencyInstructions } = req.body;
    
    student.medicalInfo = {
      bloodGroup,
      allergies: allergies || [],
      medications: medications || [],
      medicalConditions: medicalConditions || [],
      emergencyInstructions
    };
    
    await student.save();
    
    res.json({
      message: 'Medical information updated successfully',
      medicalInfo: student.medicalInfo
    });
    
  } catch (error) {
    console.error('Update medical info error:', error);
    res.status(500).json({ error: 'Failed to update medical information' });
  }
});

module.exports = router;
