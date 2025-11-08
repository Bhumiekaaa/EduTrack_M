const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  grade: {
    type: String,
    required: true,
    enum: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  },
  academicYear: {
    type: String,
    required: true
  },
  schedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    room: {
      type: String,
      trim: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster querying
subjectSchema.index({ code: 1, academicYear: 1 }, { unique: true });
subjectSchema.index({ teacher: 1 });
subjectSchema.index({ grade: 1, academicYear: 1 });

// Static method to find subjects by teacher
subjectSchema.statics.findByTeacher = async function(teacherId) {
  return this.find({ teacher: teacherId });
};

// Static method to find subjects by grade
subjectSchema.statics.findByGrade = async function(grade, academicYear) {
  return this.find({ 
    grade,
    academicYear,
    isActive: true 
  }).populate('teacher', 'firstName lastName email');
};

module.exports = mongoose.model('Subject', subjectSchema);
