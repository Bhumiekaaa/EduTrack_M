const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  
  // Parent-specific information
  parentId: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    trim: true
  },
  
  // Family information
  maritalStatus: { 
    type: String,
    enum: ['single', 'married', 'divorced', 'widowed', 'separated'],
    default: 'married'
  },
  spouse: {
    name: String,
    phone: String,
    email: String,
    occupation: String
  },
  
  // Professional information
  occupation: { 
    type: String, 
    required: true,
    trim: true
  },
  workplace: {
    name: String,
    address: String,
    phone: String,
    position: String
  },
  
  // Student relationships
  students: [{
    student: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Student',
      required: true
    },
    relationship: { 
      type: String, 
      enum: ['mother', 'father', 'guardian', 'grandparent', 'other'],
      required: true
    },
    isPrimary: { 
      type: Boolean, 
      default: false 
    },
    emergencyContact: { 
      type: Boolean, 
      default: false 
    }
  }],
  
  // Contact preferences
  contactPreferences: {
    preferredMethod: { 
      type: String,
      enum: ['email', 'phone', 'sms', 'app_notification'],
      default: 'email'
    },
    notificationSettings: {
      academicUpdates: { type: Boolean, default: true },
      attendanceAlerts: { type: Boolean, default: true },
      gradeNotifications: { type: Boolean, default: true },
      eventReminders: { type: Boolean, default: true },
      emergencyAlerts: { type: Boolean, default: true }
    },
    communicationLanguage: { 
      type: String,
      default: 'en'
    }
  },
  
  // Emergency contacts
  emergencyContacts: [{
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    address: String,
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Financial information
  financialInfo: {
    annualIncome: {
      type: String,
      enum: ['under_25k', '25k_50k', '50k_75k', '75k_100k', '100k_150k', 'over_150k', 'prefer_not_to_say']
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'check', 'bank_transfer', 'credit_card', 'other']
    },
    billingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    }
  },
  
  // Volunteering and involvement
  volunteerInterests: [{
    type: String,
    enum: ['classroom_help', 'field_trips', 'events', 'fundraising', 'sports', 'library', 'other']
  }],
  availabilityForVolunteering: {
    weekdays: { type: Boolean, default: false },
    weekends: { type: Boolean, default: false },
    evenings: { type: Boolean, default: false }
  },
  
  // Additional information
  specialNeeds: String,
  additionalNotes: String,
  
  // Status and enrollment
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  enrollmentDate: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
parentSchema.index({ parentId: 1 });
parentSchema.index({ occupation: 1 });
parentSchema.index({ status: 1 });
parentSchema.index({ 'students.student': 1 });

// Virtual for primary students
parentSchema.virtual('primaryStudents').get(function() {
  return this.students.filter(student => student.isPrimary).map(s => s.student);
});

// Virtual for all student relationships
parentSchema.virtual('studentRelationships').get(function() {
  return this.students.map(student => ({
    student: student.student,
    relationship: student.relationship,
    isPrimary: student.isPrimary,
    emergencyContact: student.emergencyContact
  }));
});

// Pre-save middleware to generate parent ID if not provided
parentSchema.pre('save', async function(next) {
  if (!this.parentId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({ 
      parentId: new RegExp(`^PAR${year}`) 
    });
    this.parentId = `PAR${year}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Static method to find parents by student
parentSchema.statics.findByStudent = function(studentId) {
  return this.find({ 'students.student': studentId, status: 'active' }).populate('user students.student');
};

// Static method to find parents by relationship
parentSchema.statics.findByRelationship = function(relationship) {
  return this.find({ 'students.relationship': relationship, status: 'active' }).populate('user');
};

// Static method to find emergency contacts for a student
parentSchema.statics.findEmergencyContacts = function(studentId) {
  return this.find({ 
    'students.student': studentId, 
    'students.emergencyContact': true,
    status: 'active' 
  }).populate('user');
};

// Instance method to add a student
parentSchema.methods.addStudent = function(studentId, relationship, isPrimary = false, emergencyContact = false) {
  // Check if student already exists
  const existingStudent = this.students.find(student => student.student.toString() === studentId.toString());
  
  if (existingStudent) {
    throw new Error('Student already associated with this parent');
  }
  
  this.students.push({
    student: studentId,
    relationship,
    isPrimary,
    emergencyContact
  });
  
  return this.save();
};

// Instance method to remove a student
parentSchema.methods.removeStudent = function(studentId) {
  this.students = this.students.filter(student => student.student.toString() !== studentId.toString());
  return this.save();
};

// Instance method to update student relationship
parentSchema.methods.updateStudentRelationship = function(studentId, relationship, isPrimary, emergencyContact) {
  const student = this.students.find(s => s.student.toString() === studentId.toString());
  
  if (!student) {
    throw new Error('Student not found');
  }
  
  student.relationship = relationship;
  student.isPrimary = isPrimary;
  student.emergencyContact = emergencyContact;
  
  return this.save();
};

module.exports = mongoose.model('Parent', parentSchema);
