const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  
  // Student-specific information
  studentId: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    trim: true
  },
  grade: { 
    type: String, 
    required: true,
    enum: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  },
  class: { 
    type: String,
    trim: true
  },
  section: { 
    type: String,
    trim: true
  },
  
  // Academic information
  enrollmentDate: { 
    type: Date, 
    default: Date.now 
  },
  academicYear: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'graduated', 'transferred', 'suspended'],
    default: 'active'
  },
  
  // Parent/Guardian information
  parents: [{
    parent: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Parent' 
    },
    relationship: { 
      type: String, 
      enum: ['mother', 'father', 'guardian', 'grandparent', 'other'],
      required: true
    },
    isPrimary: { 
      type: Boolean, 
      default: false 
    }
  }],
  
  // Emergency contact
  emergencyContact: {
    name: { type: String },
    relationship: { type: String },
    phone: { type: String },
    email: { type: String }
  },
  
  // Medical information
  medicalInfo: {
    bloodGroup: { 
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    allergies: [String],
    medications: [String],
    medicalConditions: [String],
    emergencyInstructions: String
  },
  
  // Transportation
  transportation: {
    mode: { 
      type: String,
      enum: ['bus', 'private_vehicle', 'walking', 'bicycle', 'public_transport', 'other']
    },
    busRoute: String,
    pickupLocation: String,
    dropoffLocation: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
studentSchema.index({ studentId: 1 });
studentSchema.index({ grade: 1 });
studentSchema.index({ academicYear: 1 });
studentSchema.index({ status: 1 });

// Virtual for current age
studentSchema.virtual('age').get(function() {
  if (this.user && this.user.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.user.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
  return null;
});

// Virtual for primary parent
studentSchema.virtual('primaryParent').get(function() {
  const primaryParent = this.parents.find(parent => parent.isPrimary);
  return primaryParent ? primaryParent.parent : null;
});

// Pre-save middleware to generate student ID if not provided
studentSchema.pre('save', async function(next) {
  if (!this.studentId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({ 
      studentId: new RegExp(`^STU${year}`) 
    });
    this.studentId = `STU${year}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Static method to find students by grade
studentSchema.statics.findByGrade = function(grade) {
  return this.find({ grade, status: 'active' }).populate('user');
};

// Static method to find students by academic year
studentSchema.statics.findByAcademicYear = function(academicYear) {
  return this.find({ academicYear, status: 'active' }).populate('user');
};

module.exports = mongoose.model('Student', studentSchema);
