const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    default: 'present'
  },
  remarks: {
    type: String,
    trim: true
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  }
});

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  class: {
    type: String,
    required: true
  },
  records: [attendanceRecordSchema],
  academicYear: {
    type: String,
    required: true
  },
  term: {
    type: String,
    enum: ['1', '2', '3'],
    required: true
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lockedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index for unique attendance per subject per date
attendanceSchema.index({ date: 1, subject: 1, class: 1 }, { unique: true });
attendanceSchema.index({ class: 1, date: 1 });
attendanceSchema.index({ 'records.student': 1, date: 1 });

// Static method to mark attendance
attendanceSchema.statics.markAttendance = async function(attendanceData) {
  const { date, subject, class: classId, records, academicYear, term, recordedBy } = attendanceData;
  
  // Check if attendance already exists for this date and subject
  let attendance = await this.findOne({ date, subject, class: classId });
  
  if (attendance && attendance.isLocked) {
    throw new Error('Attendance is locked and cannot be modified');
  }
  
  if (!attendance) {
    // Create new attendance
    attendance = new this({
      date,
      subject,
      class: classId,
      academicYear,
      term,
      records: []
    });
  }
  
  // Update or add records
  records.forEach(record => {
    const existingRecordIndex = attendance.records.findIndex(
      r => r.student.toString() === record.student.toString()
    );
    
    const newRecord = {
      student: record.student,
      status: record.status,
      remarks: record.remarks,
      recordedBy: recordedBy
    };
    
    if (existingRecordIndex >= 0) {
      attendance.records[existingRecordIndex] = newRecord;
    } else {
      attendance.records.push(newRecord);
    }
  });
  
  return attendance.save();
};

// Method to get student attendance summary
attendanceSchema.statics.getStudentAttendance = async function(studentId, classId, academicYear) {
  const pipeline = [
    {
      $match: {
        class: classId,
        academicYear,
        'records.student': mongoose.Types.ObjectId(studentId)
      }
    },
    {
      $unwind: '$records'
    },
    {
      $match: {
        'records.student': mongoose.Types.ObjectId(studentId)
      }
    },
    {
      $group: {
        _id: {
          subject: '$subject',
          term: '$term'
        },
        totalClasses: { $sum: 1 },
        present: {
          $sum: {
            $cond: [{ $eq: ['$records.status', 'present'] }, 1, 0]
          }
        },
        absent: {
          $sum: {
            $cond: [{ $eq: ['$records.status', 'absent'] }, 1, 0]
          }
        },
        late: {
          $sum: {
            $cond: [{ $eq: ['$records.status', 'late'] }, 1, 0]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'subjects',
        localField: '_id.subject',
        foreignField: '_id',
        as: 'subject'
      }
    },
    {
      $unwind: '$subject'
    },
    {
      $project: {
        _id: 0,
        subject: {
          _id: '$subject._id',
          name: '$subject.name',
          code: '$subject.code'
        },
        term: '$_id.term',
        totalClasses: 1,
        present: 1,
        absent: 1,
        late: 1,
        attendancePercentage: {
          $multiply: [
            {
              $divide: [
                { $add: ['$present', { $multiply: ['$late', 0.5] }] },
                { $max: [1, '$totalClasses'] }
              ]
            },
            100
          ]
        }
      }
    },
    {
      $sort: { 'subject.name': 1, term: 1 }
    }
  ];
  
  return this.aggregate(pipeline);
};

module.exports = mongoose.model('Attendance', attendanceSchema);
