const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  submittedOn: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['submitted', 'late', 'graded'],
    default: 'submitted'
  },
  fileUrl: {
    type: String,
    required: true
  },
  grade: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: {
    type: String,
    trim: true
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  gradedAt: {
    type: Date
  }
});

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  class: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 1
  },
  submissions: [submissionSchema],
  status: {
    type: String,
    enum: ['draft', 'published', 'graded', 'archived'],
    default: 'draft'
  },
  attachments: [{
    name: String,
    url: String,
    size: Number,
    type: String
  }],
  academicYear: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for faster querying
assignmentSchema.index({ subject: 1, status: 1 });
assignmentSchema.index({ teacher: 1, status: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ class: 1, status: 1 });

// Static method to find assignments by teacher
assignmentSchema.statics.findByTeacher = async function(teacherId, status = null) {
  const query = { teacher: teacherId };
  if (status) query.status = status;
  return this.find(query).populate('subject', 'name code');
};

// Static method to find assignments by student
assignmentSchema.statics.findByStudent = async function(studentId, classId, status = null) {
  const query = { class: classId };
  if (status) query.status = status;
  
  const assignments = await this.find(query)
    .populate('subject', 'name code')
    .populate('teacher', 'firstName lastName')
    .lean();

  // Add submission status for the student
  return assignments.map(assignment => {
    const submission = assignment.submissions.find(
      sub => sub.student.toString() === studentId.toString()
    );
    
    return {
      ...assignment,
      submissionStatus: submission ? submission.status : 'not_submitted',
      grade: submission ? submission.grade : null,
      submitted: !!submission
    };
  });
};

// Method to add a submission
assignmentSchema.methods.addSubmission = async function(submissionData) {
  const existingSubmissionIndex = this.submissions.findIndex(
    sub => sub.student.toString() === submissionData.student.toString()
  );

  const submission = {
    ...submissionData,
    status: new Date() > this.dueDate ? 'late' : 'submitted'
  };

  if (existingSubmissionIndex >= 0) {
    this.submissions[existingSubmissionIndex] = submission;
  } else {
    this.submissions.push(submission);
  }

  await this.save();
  return this;
};

module.exports = mongoose.model('Assignment', assignmentSchema);
