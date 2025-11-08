const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true }
});

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: { 
    type: String, 
    required: true, 
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  lastName: { 
    type: String, 
    required: true, 
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  phone: { 
    type: String, 
    required: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  dateOfBirth: { 
    type: Date, 
    required: true 
  },
  
  // Role and Status
  role: { 
    type: String, 
    required: true, 
    enum: ['student', 'teacher', 'parent'],
    default: 'student'
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isEmailVerified: { 
    type: Boolean, 
    default: false 
  },
  
  // Address
  address: { 
    type: addressSchema, 
    required: true 
  },
  
  // Role-specific data (flexible schema)
  roleData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Authentication
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  
  // Remember me
  rememberToken: { type: String },
  rememberExpires: { type: Date },
  
  // Email verification
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  
  // Password reset
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account locked status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return token;
};

// Instance method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return token;
};

// Instance method to generate remember token
userSchema.methods.generateRememberToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.rememberToken = crypto.createHash('sha256').update(token).digest('hex');
  this.rememberExpires = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  
  return token;
};

// Static method to find user by email verification token
userSchema.statics.findByEmailVerificationToken = function(token) {
  const crypto = require('crypto');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  return this.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  });
};

// Static method to find user by password reset token
userSchema.statics.findByPasswordResetToken = function(token) {
  const crypto = require('crypto');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  return this.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
};

// Static method to find user by remember token
userSchema.statics.findByRememberToken = function(token) {
  const crypto = require('crypto');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  return this.findOne({
    rememberToken: hashedToken,
    rememberExpires: { $gt: Date.now() }
  });
};

module.exports = mongoose.model('User', userSchema);
