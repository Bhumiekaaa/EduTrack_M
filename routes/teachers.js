const express = require('express');
const { body, validationResult } = require('express-validator');
const Teacher = require('../models/Teacher');
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

// Get all teachers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, department, designation, status = 'active' } = req.query;
    
    const filter = { status };
    
    if (department) {
      filter.department = department;
    }
    
    if (designation) {
      filter.designation = designation;
    }
    
    const teachers = await Teacher.find(filter)
      .populate('user', 'firstName lastName email phone dateOfBirth address')
      .sort({ teacherId: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Teacher.countDocuments(filter);
    
    res.json({
      teachers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
    
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

// Get teacher by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('user', 'firstName lastName email phone dateOfBirth address')
      .populate('reportingManager', 'firstName lastName email');
    
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    res.json(teacher);
    
  } catch (error) {
    console.error('Get teacher error:', error);
    res.status(500).json({ error: 'Failed to fetch teacher' });
  }
});

// Get teacher by user ID
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.params.userId })
      .populate('user', 'firstName lastName email phone dateOfBirth address')
      .populate('reportingManager', 'firstName lastName email');
    
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    res.json(teacher);
    
  } catch (error) {
    console.error('Get teacher by user error:', error);
    res.status(500).json({ error: 'Failed to fetch teacher' });
  }
});

// Update teacher profile
router.put('/:id', authenticateToken, [
  body('department').optional().trim().isLength({ min: 2, max: 100 }),
  body('subjects').optional().isArray(),
  body('qualification').optional().trim().isLength({ min: 2, max: 200 }),
  body('specialization').optional().trim().isLength({ max: 100 }),
  body('designation').optional().isIn(['teacher', 'senior_teacher', 'head_teacher', 'vice_principal', 'principal', 'coordinator']),
  body('status').optional().isIn(['active', 'inactive', 'on_leave', 'terminated', 'retired'])
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
    
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    const { department, subjects, qualification, specialization, designation, status } = req.body;
    
    if (department !== undefined) teacher.department = department;
    if (subjects !== undefined) teacher.subjects = subjects;
    if (qualification !== undefined) teacher.qualification = qualification;
    if (specialization !== undefined) teacher.specialization = specialization;
    if (designation !== undefined) teacher.designation = designation;
    if (status !== undefined) teacher.status = status;
    
    await teacher.save();
    
    const updatedTeacher = await Teacher.findById(req.params.id)
      .populate('user', 'firstName lastName email phone dateOfBirth address');
    
    res.json({
      message: 'Teacher profile updated successfully',
      teacher: updatedTeacher
    });
    
  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({ error: 'Failed to update teacher profile' });
  }
});

// Add performance rating
router.post('/:id/performance', authenticateToken, [
  body('academicYear').notEmpty().withMessage('Academic year required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedback').optional().trim().isLength({ max: 1000 })
], async (req, res) => {
  try {
    // TODO: Add authorization check (only admin/principal can add ratings)
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    const { academicYear, rating, feedback } = req.body;
    
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    const ratingData = {
      academicYear,
      rating,
      feedback,
      evaluatedBy: req.user.userId,
      evaluatedAt: new Date()
    };
    
    await teacher.addPerformanceRating(ratingData);
    
    res.json({
      message: 'Performance rating added successfully',
      rating: ratingData
    });
    
  } catch (error) {
    console.error('Add performance rating error:', error);
    res.status(500).json({ error: 'Failed to add performance rating' });
  }
});

// Assign classes to teacher
router.post('/:id/classes', authenticateToken, [
  body('assignedClasses').isArray().withMessage('Assigned classes must be an array'),
  body('assignedClasses.*.grade').notEmpty().withMessage('Grade required'),
  body('assignedClasses.*.section').notEmpty().withMessage('Section required'),
  body('assignedClasses.*.subject').notEmpty().withMessage('Subject required'),
  body('assignedClasses.*.academicYear').notEmpty().withMessage('Academic year required')
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
    
    const { assignedClasses } = req.body;
    
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    teacher.assignedClasses = assignedClasses;
    await teacher.save();
    
    res.json({
      message: 'Classes assigned successfully',
      assignedClasses: teacher.assignedClasses
    });
    
  } catch (error) {
    console.error('Assign classes error:', error);
    res.status(500).json({ error: 'Failed to assign classes' });
  }
});

// Get teachers by department
router.get('/department/:department', authenticateToken, async (req, res) => {
  try {
    const teachers = await Teacher.findByDepartment(req.params.department);
    
    res.json({ teachers });
    
  } catch (error) {
    console.error('Get teachers by department error:', error);
    res.status(500).json({ error: 'Failed to fetch teachers by department' });
  }
});

// Get teachers by subject
router.get('/subject/:subject', authenticateToken, async (req, res) => {
  try {
    const teachers = await Teacher.findBySubject(req.params.subject);
    
    res.json({ teachers });
    
  } catch (error) {
    console.error('Get teachers by subject error:', error);
    res.status(500).json({ error: 'Failed to fetch teachers by subject' });
  }
});

module.exports = router;
