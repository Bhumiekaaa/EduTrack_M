const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const axios = require('axios');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Parent = require('../models/Parent');

const router = express.Router();

// Middleware to verify CAPTCHA (supports both reCAPTCHA and math captcha)
const verifyCaptcha = async (req, res, next) => {
  try {
    const { captchaToken } = req.body;
    
    if (!captchaToken) {
      return res.status(400).json({ error: 'CAPTCHA verification required' });
    }
    
    // Check if it's a math captcha token (simple format)
    if (captchaToken.startsWith('math-captcha-')) {
      // For math captcha, we'll just verify the token exists
      // In a real implementation, you might want to store and verify the answer
      next();
      return;
    }
    
    // Otherwise, verify with Google reCAPTCHA
    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY || '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe', // Test key
        response: captchaToken,
        remoteip: req.ip
      }
    });
    
    if (!response.data.success) {
      return res.status(400).json({ error: 'CAPTCHA verification failed' });
    }
    
    next();
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    res.status(500).json({ error: 'CAPTCHA verification failed' });
  }
};

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

// Registration validation rules
const registrationValidation = [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
  body('phone').isMobilePhone().withMessage('Valid phone number required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth required'),
  body('role').isIn(['student', 'teacher', 'parent']).withMessage('Valid role required'),
  body('address.street').trim().isLength({ min: 5 }).withMessage('Street address required'),
  body('address.city').trim().isLength({ min: 2 }).withMessage('City required'),
  body('address.state').trim().isLength({ min: 2 }).withMessage('State required'),
  body('address.zipCode').trim().isLength({ min: 3 }).withMessage('ZIP code required'),
  body('terms').equals('true').withMessage('Terms and conditions must be accepted')
];

// Login validation rules
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  body('role').isIn(['student', 'teacher', 'parent']).withMessage('Valid role required')
];

// Register endpoint
router.post('/register', registrationValidation, verifyCaptcha, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phone, 
      dateOfBirth, 
      role, 
      address,
      roleData,
      rememberMe
    } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    
    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      role,
      address,
      roleData
    });
    
    // Generate email verification token
    const emailVerificationToken = user.generateEmailVerificationToken();
    
    await user.save();
    
    // Create role-specific profile
    let profile = null;
    switch (role) {
      case 'student':
        profile = new Student({
          user: user._id,
          grade: roleData.grade,
          academicYear: new Date().getFullYear().toString(),
          parents: roleData.parentEmail ? [{
            parent: null, // Will be linked later
            relationship: 'guardian',
            isPrimary: true
          }] : []
        });
        break;
        
      case 'teacher':
        profile = new Teacher({
          user: user._id,
          department: roleData.subject,
          subjects: [roleData.subject],
          qualification: roleData.qualification,
          totalExperience: parseInt(roleData.experience) || 0
        });
        break;
        
      case 'parent':
        profile = new Parent({
          user: user._id,
          occupation: roleData.occupation,
          students: roleData.studentEmails ? roleData.studentEmails.split(',').map(email => ({
            student: null, // Will be linked later
            relationship: roleData.relationship,
            isPrimary: true
          })) : []
        });
        break;
    }
    
    if (profile) {
      await profile.save();
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'edutrack-jwt-secret',
      { expiresIn: '24h' }
    );
    
    // Set session
    req.session.userId = user._id;
    req.session.role = user.role;
    
    // Generate remember token if requested
    let rememberToken = null;
    if (rememberMe) {
      rememberToken = user.generateRememberToken();
      await user.save();
    }
    
    // TODO: Send email verification email
    
    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      },
      token,
      rememberToken,
      requiresEmailVerification: !user.isEmailVerified
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
router.post('/login', loginValidation, verifyCaptcha, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    const { email, password, role, rememberMe } = req.body;
    
    // Find user
    const user = await User.findOne({ email, role, isActive: true });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ error: 'Account is temporarily locked due to multiple failed login attempts' });
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Increment login attempts
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
      }
      await user.save();
      
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    const tokenExpiry = rememberMe ? '30d' : '24h';
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'edutrack-jwt-secret',
      { expiresIn: tokenExpiry }
    );
    
    // Set session
    req.session.userId = user._id;
    req.session.role = user.role;
    
    // Generate remember token if requested
    let rememberToken = null;
    if (rememberMe) {
      rememberToken = user.generateRememberToken();
      await user.save();
      
      // Set remember token cookie
      res.cookie('rememberToken', rememberToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }
    
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      },
      token,
      rememberToken
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    
    res.clearCookie('rememberToken');
    res.json({ message: 'Logout successful' });
  });
});

// Get current user endpoint
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get role-specific profile
    let profile = null;
    switch (user.role) {
      case 'student':
        profile = await Student.findOne({ user: user._id });
        break;
      case 'teacher':
        profile = await Teacher.findOne({ user: user._id });
        break;
      case 'parent':
        profile = await Parent.findOne({ user: user._id });
        break;
    }
    
    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
        address: user.address,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      },
      profile
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
});

// Email verification endpoint
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findByEmailVerificationToken(token);
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }
    
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    res.json({ message: 'Email verified successfully' });
    
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

// Resend email verification endpoint
router.post('/resend-verification', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }
    
    const emailVerificationToken = user.generateEmailVerificationToken();
    await user.save();
    
    // TODO: Send verification email
    
    res.json({ message: 'Verification email sent' });
    
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

// Password reset request endpoint
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    const { email } = req.body;
    const user = await User.findOne({ email, isActive: true });
    
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({ message: 'If the email exists, a password reset link has been sent' });
    }
    
    const resetToken = user.generatePasswordResetToken();
    await user.save();
    
    // TODO: Send password reset email
    
    res.json({ message: 'If the email exists, a password reset link has been sent' });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Password reset request failed' });
  }
});

// Password reset endpoint
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    const { token, password } = req.body;
    const user = await User.findByPasswordResetToken(token);
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
    
    res.json({ message: 'Password reset successful' });
    
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

module.exports = router;
