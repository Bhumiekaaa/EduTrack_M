const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
  examType: {
    type: String,
    required: true,
    enum: ['quiz', 'midterm', 'final', 'assignment', 'project']
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  marksObtained: {
    type: Number,
    required: true,
    min: 0
  },
  maxMarks: {
    type: Number,
    required: true,
    min: 1
  },
  grade: {
    type: String,
    trim: true
  },
  remarks: {
    type: String,
    trim: true
  },
  published: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  }
});

const resultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  class: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  term: {
    type: String,
    enum: ['1', '2', '3'],
    required: true
  },
  examResults: [examResultSchema],
  totalMarks: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  },
  rank: {
    type: Number
  },
  remarks: {
    type: String,
    trim: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index for unique results per student per term
resultSchema.index(
  { student: 1, academicYear: 1, term: 1 },
  { unique: true }
);

// Pre-save hook to calculate total marks and percentage
resultSchema.pre('save', function(next) {
  if (this.isModified('examResults')) {
    const total = this.examResults.reduce((sum, exam) => sum + exam.marksObtained, 0);
    const maxTotal = this.examResults.reduce((sum, exam) => sum + exam.maxMarks, 0);
    
    this.totalMarks = total;
    this.percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
    
    // Simple grade calculation (can be customized)
    if (this.percentage >= 90) this.grade = 'A+';
    else if (this.percentage >= 80) this.grade = 'A';
    else if (this.percentage >= 70) this.grade = 'B';
    else if (this.percentage >= 60) this.grade = 'C';
    else if (this.percentage >= 50) this.grade = 'D';
    else this.grade = 'F';
  }
  next();
});

// Static method to get student results
resultSchema.statics.getStudentResults = async function(studentId, academicYear = null) {
  const match = { student: studentId };
  if (academicYear) match.academicYear = academicYear;
  
  return this.find(match)
    .populate({
      path: 'examResults.subject',
      select: 'name code'
    })
    .sort({ academicYear: -1, term: -1 });
};

// Static method to get class results
resultSchema.statics.getClassResults = async function(classId, academicYear, term) {
  const results = await this.find({
    class: classId,
    academicYear,
    term,
    isPublished: true
  })
  .populate('student', 'studentId')
  .sort({ totalMarks: -1 });

  // Calculate ranks
  return results.map((result, index) => {
    result.rank = index + 1;
    return result;
  });
};

// Method to add or update an exam result
resultSchema.methods.updateExamResult = async function(examData) {
  const { examType, subject, marksObtained, maxMarks, grade, remarks } = examData;
  
  const examIndex = this.examResults.findIndex(
    exam => exam.examType === examType && exam.subject.toString() === subject.toString()
  );
  
  const examResult = {
    examType,
    subject,
    marksObtained,
    maxMarks,
    grade,
    remarks
  };
  
  if (examIndex >= 0) {
    this.examResults[examIndex] = examResult;
  } else {
    this.examResults.push(examResult);
  }
  
  return this.save();
};

module.exports = mongoose.model('Result', resultSchema);
