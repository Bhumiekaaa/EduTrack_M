const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const { generateToken } = require('../utils/auth');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, dateOfBirth, role, studentId } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      role
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user
    await user.save();

    // If student, create student profile
    if (role === 'student' && studentId) {
      const student = new Student({
        user: user._id,
        studentId,
        grade: req.body.grade || '1',
        class: req.body.class || 'A',
        section: req.body.section || 'A',
        academicYear: req.body.academicYear || '2023-24'
      });
      await student.save();
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // Get additional user data based on role
    let userData = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      token
    };

    // If student, include student ID
    if (user.role === 'student') {
      const student = await Student.findOne({ user: user._id });
      if (student) {
        userData.studentId = student.studentId;
        userData.grade = student.grade;
        userData.class = student.class;
      }
    }

    res.json(userData);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let userData = user.toObject();
    
    // If student, include student data
    if (user.role === 'student') {
      const student = await Student.findOne({ user: user._id });
      if (student) {
        userData.studentId = student.studentId;
        userData.grade = student.grade;
        userData.class = student.class;
      }
    }

    res.json(userData);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
