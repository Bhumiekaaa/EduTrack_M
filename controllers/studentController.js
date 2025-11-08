const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Result = require('../models/Result');
const Notification = require('../models/Notification');

// @desc    Get student dashboard data
// @route   GET /api/students/dashboard
// @access  Private
exports.getDashboardData = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get attendance summary
    const attendanceSummary = await Attendance.aggregate([
      {
        $match: {
          class: student.class,
          'records.student': student._id
        }
      },
      {
        $unwind: '$records'
      },
      {
        $match: {
          'records.student': student._id
        }
      },
      {
        $group: {
          _id: null,
          totalClasses: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ['$records.status', 'present'] }, 1, 0]
            }
          },
          late: {
            $sum: {
              $cond: [{ $eq: ['$records.status', 'late'] }, 0.5, 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalClasses: 1,
          present: 1,
          late: 1,
          attendancePercentage: {
            $multiply: [
              {
                $divide: [
                  { $add: ['$present', '$late'] },
                  { $max: [1, '$totalClasses'] }
                ]
              },
              100
            ]
          }
        }
      }
    ]);

    // Get pending assignments count
    const pendingAssignments = await Assignment.countDocuments({
      class: student.class,
      'submissions.student': { $ne: student._id },
      dueDate: { $gte: new Date() }
    });

    // Get upcoming tests
    const upcomingTests = await Assignment.find({
      class: student.class,
      dueDate: { $gte: new Date() },
      type: 'exam'
    })
      .sort('dueDate')
      .limit(3)
      .select('title subject dueDate');

    // Get fee status (simplified)
    const feeStatus = {
      totalAmount: 50000,
      paidAmount: 30000,
      dueAmount: 20000,
      lastPaymentDate: '2023-10-15',
      nextDueDate: '2023-12-01',
      status: 'partially_paid'
    };

    // Get notifications
    const notifications = await Notification.find({
      'recipients.user': req.user._id,
      isActive: true
    })
      .sort('-createdAt')
      .limit(5)
      .select('title message type createdAt');

    res.json({
      attendance: attendanceSummary[0] || { totalClasses: 0, present: 0, late: 0, attendancePercentage: 0 },
      pendingAssignments,
      upcomingTests,
      feeStatus,
      notifications
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get student attendance
// @route   GET /api/students/attendance
// @access  Private
exports.getAttendance = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const attendance = await Attendance.getStudentAttendance(
      student._id,
      student.class,
      student.academicYear
    );

    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get student assignments
// @route   GET /api/students/assignments
// @access  Private
exports.getAssignments = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const assignments = await Assignment.findByStudent(student._id, student.class);
    res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Submit assignment
// @route   POST /api/students/assignments/:id/submit
// @access  Private
exports.submitAssignment = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // In a real app, you would handle file upload here
    const submission = {
      student: student._id,
      fileUrl: req.body.fileUrl, // URL from file upload service
      status: new Date() > assignment.dueDate ? 'late' : 'submitted'
    };

    await assignment.addSubmission(submission);

    // Create notification for teacher
    await Notification.createNotification({
      title: 'New Assignment Submission',
      message: `${student.firstName} ${student.lastName} has submitted an assignment.`,
      type: 'assignment',
      recipients: [assignment.teacher],
      relatedTo: {
        type: 'assignment',
        id: assignment._id
      },
      createdBy: student.user
    });

    res.json({ message: 'Assignment submitted successfully' });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get student results
// @route   GET /api/students/results
// @access  Private
exports.getResults = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const results = await Result.getStudentResults(student._id);
    res.json(results);
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get student schedule
// @route   GET /api/students/schedule
// @access  Private
exports.getSchedule = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get subjects for the student's class
    const subjects = await Subject.find({
      grade: student.grade,
      academicYear: student.academicYear
    }).populate('teacher', 'firstName lastName');

    // Format schedule by day
    const schedule = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: []
    };

    subjects.forEach(subject => {
      subject.schedule.forEach(session => {
        schedule[session.day].push({
          subject: {
            _id: subject._id,
            name: subject.name,
            code: subject.code
          },
          teacher: subject.teacher,
          startTime: session.startTime,
          endTime: session.endTime,
          room: session.room
        });
      });
    });

    // Sort each day's schedule by start time
    Object.keys(schedule).forEach(day => {
      schedule[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    res.json(schedule);
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
