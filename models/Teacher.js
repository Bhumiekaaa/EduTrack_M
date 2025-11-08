const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  
  // Teacher-specific information
  teacherId: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    trim: true
  },
  employeeNumber: { 
    type: String, 
    unique: true,
    sparse: true
  },
  
  // Professional information
  department: { 
    type: String, 
    required: true,
    trim: true
  },
  subjects: [{ 
    type: String, 
    required: true,
    trim: true
  }],
  qualification: { 
    type: String, 
    required: true,
    trim: true
  },
  specialization: { 
    type: String,
    trim: true
  },
  
  // Employment details
  joiningDate: { 
    type: Date, 
    default: Date.now 
  },
  employmentType: { 
    type: String, 
    enum: ['full-time', 'part-time', 'contract', 'substitute'],
    default: 'full-time'
  },
  designation: { 
    type: String,
    enum: ['teacher', 'senior_teacher', 'head_teacher', 'vice_principal', 'principal', 'coordinator'],
    default: 'teacher'
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'on_leave', 'terminated', 'retired'],
    default: 'active'
  },
  
  // Experience and skills
  totalExperience: { 
    type: Number, 
    default: 0,
    min: 0
  },
  previousSchools: [{
    schoolName: String,
    position: String,
    fromDate: Date,
    toDate: Date,
    duration: String
  }],
  
  // Professional development
  certifications: [{
    name: String,
    issuingOrganization: String,
    issueDate: Date,
    expiryDate: Date,
    credentialId: String
  }],
  
  // Class and schedule information
  assignedClasses: [{
    grade: String,
    section: String,
    subject: String,
    academicYear: String
  }],
  
  // Contact and emergency information
  emergencyContact: {
    name: { type: String },
    relationship: { type: String },
    phone: { type: String },
    email: { type: String }
  },
  
  // Administrative information
  reportingManager: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Teacher' 
  },
  salary: {
    basic: { type: Number },
    allowances: { type: Number },
    total: { type: Number }
  },
  
  // Performance and evaluation
  performanceRatings: [{
    academicYear: String,
    rating: { 
      type: Number, 
      min: 1, 
      max: 5 
    },
    feedback: String,
    evaluatedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    evaluatedAt: { 
      type: Date, 
      default: Date.now 
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
teacherSchema.index({ teacherId: 1 });
teacherSchema.index({ employeeNumber: 1 });
teacherSchema.index({ department: 1 });
teacherSchema.index({ subjects: 1 });
teacherSchema.index({ status: 1 });

// Virtual for years of experience at current school
teacherSchema.virtual('currentSchoolExperience').get(function() {
  if (this.joiningDate) {
    const today = new Date();
    const joiningDate = new Date(this.joiningDate);
    const diffTime = Math.abs(today - joiningDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 365);
  }
  return 0;
});

// Virtual for primary subject
teacherSchema.virtual('primarySubject').get(function() {
  return this.subjects && this.subjects.length > 0 ? this.subjects[0] : null;
});

// Pre-save middleware to generate teacher ID if not provided
teacherSchema.pre('save', async function(next) {
  if (!this.teacherId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({ 
      teacherId: new RegExp(`^TCH${year}`) 
    });
    this.teacherId = `TCH${year}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Pre-save middleware to calculate total salary
teacherSchema.pre('save', function(next) {
  if (this.salary && this.salary.basic && this.salary.allowances) {
    this.salary.total = this.salary.basic + this.salary.allowances;
  }
  next();
});

// Static method to find teachers by department
teacherSchema.statics.findByDepartment = function(department) {
  return this.find({ department, status: 'active' }).populate('user');
};

// Static method to find teachers by subject
teacherSchema.statics.findBySubject = function(subject) {
  return this.find({ subjects: subject, status: 'active' }).populate('user');
};

// Static method to find teachers by designation
teacherSchema.statics.findByDesignation = function(designation) {
  return this.find({ designation, status: 'active' }).populate('user');
};

// Instance method to add performance rating
teacherSchema.methods.addPerformanceRating = function(ratingData) {
  this.performanceRatings.push(ratingData);
  return this.save();
};

// Instance method to get current academic year classes
teacherSchema.methods.getCurrentClasses = function(academicYear) {
  return this.assignedClasses.filter(cls => cls.academicYear === academicYear);
};

module.exports = mongoose.model('Teacher', teacherSchema);
