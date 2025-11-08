const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');
const Assignment = require('../models/Assignment');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');

// Connect to MongoDB
mongoose.connect(config.db.uri, config.db.options)
  .then(() => console.log('Connected to MongoDB for seeding...'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Clear existing data
const clearData = async () => {
  console.log('Clearing existing data...');
  await User.deleteMany({});
  await Student.deleteMany({});
  await Teacher.deleteMany({});
  await Subject.deleteMany({});
  await Assignment.deleteMany({});
  await Attendance.deleteMany({});
  await Result.deleteMany({});
  console.log('Existing data cleared');
};

// Create sample users
const createUsers = async () => {
  console.log('Creating sample users...');
  
  // Create admin user
  const admin = new User({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@edutrack.com',
    password: await bcrypt.hash('admin123', 10),
    role: 'admin',
    isEmailVerified: true,
    phone: '1234567890',
    dateOfBirth: new Date('1990-01-01')
  });
  await admin.save();
  
  // Create teachers
  const teacher1 = new User({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@edutrack.com',
    password: await bcrypt.hash('teacher123', 10),
    role: 'teacher',
    isEmailVerified: true,
    phone: '1234567891',
    dateOfBirth: new Date('1985-05-15')
  });
  await teacher1.save();
  
  const teacher2 = new User({
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@edutrack.com',
    password: await bcrypt.hash('teacher123', 10),
    role: 'teacher',
    isEmailVerified: true,
    phone: '1234567892',
    dateOfBirth: new Date('1988-08-20')
  });
  await teacher2.save();
  
  // Create students
  const student1 = new User({
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@edutrack.com',
    password: await bcrypt.hash('student123', 10),
    role: 'student',
    isEmailVerified: true,
    phone: '1234567893',
    dateOfBirth: new Date('2005-03-10')
  });
  await student1.save();
  
  const student2 = new User({
    firstName: 'Bob',
    lastName: 'Williams',
    email: 'bob.williams@edutrack.com',
    password: await bcrypt.hash('student123', 10),
    role: 'student',
    isEmailVerified: true,
    phone: '1234567894',
    dateOfBirth: new Date('2005-06-15')
  });
  await student2.save();
  
  return { admin, teacher1, teacher2, student1, student2 };
};

// Create sample students
const createStudents = async (users) => {
  console.log('Creating sample students...');
  
  const student1 = new Student({
    user: users.student1._id,
    studentId: 'STU2023001',
    grade: '10',
    class: 'A',
    section: 'A',
    academicYear: '2023-24',
    enrollmentDate: new Date('2023-04-01'),
    status: 'active'
  });
  await student1.save();
  
  const student2 = new Student({
    user: users.student2._id,
    studentId: 'STU2023002',
    grade: '10',
    class: 'A',
    section: 'A',
    academicYear: '2023-24',
    enrollmentDate: new Date('2023-04-01'),
    status: 'active'
  });
  await student2.save();
  
  return { student1, student2 };
};

// Create sample teachers
const createTeachers = async (users) => {
  console.log('Creating sample teachers...');
  
  const teacher1 = new Teacher({
    user: users.teacher1._id,
    employeeId: 'TCH2023001',
    department: 'Science',
    qualification: 'M.Sc, B.Ed',
    joiningDate: new Date('2020-06-15'),
    subjects: []
  });
  await teacher1.save();
  
  const teacher2 = new Teacher({
    user: users.teacher2._id,
    employeeId: 'TCH2023002',
    department: 'Mathematics',
    qualification: 'M.Sc, B.Ed',
    joiningDate: new Date('2021-01-10'),
    subjects: []
  });
  await teacher2.save();
  
  return { teacher1, teacher2 };
};

// Create sample subjects
const createSubjects = async (teachers) => {
  console.log('Creating sample subjects...');
  
  const subjects = [
    {
      name: 'Mathematics',
      code: 'MATH101',
      description: 'Advanced Mathematics',
      credits: 4,
      teacher: teachers.teacher1._id,
      grade: '10',
      academicYear: '2023-24',
      schedule: [
        { day: 'Monday', startTime: '09:00', endTime: '10:00', room: 'A101' },
        { day: 'Wednesday', startTime: '09:00', endTime: '10:00', room: 'A101' },
        { day: 'Friday', startTime: '09:00', endTime: '10:00', room: 'A101' }
      ]
    },
    {
      name: 'Science',
      code: 'SCI101',
      description: 'General Science',
      credits: 4,
      teacher: teachers.teacher2._id,
      grade: '10',
      academicYear: '2023-24',
      schedule: [
        { day: 'Tuesday', startTime: '10:00', endTime: '11:00', room: 'LAB1' },
        { day: 'Thursday', startTime: '10:00', endTime: '11:00', room: 'LAB1' }
      ]
    },
    {
      name: 'English',
      code: 'ENG101',
      description: 'English Language and Literature',
      credits: 3,
      teacher: teachers.teacher1._id,
      grade: '10',
      academicYear: '2023-24',
      schedule: [
        { day: 'Monday', startTime: '11:00', endTime: '12:00', room: 'A102' },
        { day: 'Wednesday', startTime: '11:00', endTime: '12:00', room: 'A102' }
      ]
    }
  ];
  
  const createdSubjects = await Subject.insertMany(subjects);
  return createdSubjects;
};

// Create sample assignments
const createAssignments = async (subjects, students) => {
  console.log('Creating sample assignments...');
  
  const assignments = [
    {
      title: 'Math Assignment 1',
      description: 'Complete exercises 1-10 from chapter 5',
      subject: subjects[0]._id,
      teacher: subjects[0].teacher,
      class: '10A',
      dueDate: new Date('2023-11-15T23:59:59'),
      totalMarks: 100,
      submissions: [
        {
          student: students.student1._id,
          submittedOn: new Date('2023-11-14T10:30:00'),
          status: 'submitted',
          fileUrl: 'https://example.com/assignments/math1-submission1.pdf',
          grade: 85,
          feedback: 'Good work!'
        }
      ],
      status: 'published',
      academicYear: '2023-24'
    },
    {
      title: 'Science Project',
      description: 'Prepare a project on renewable energy sources',
      subject: subjects[1]._id,
      teacher: subjects[1].teacher,
      class: '10A',
      dueDate: new Date('2023-11-20T23:59:59'),
      totalMarks: 50,
      submissions: [],
      status: 'published',
      academicYear: '2023-24'
    }
  ];
  
  const createdAssignments = await Assignment.insertMany(assignments);
  return createdAssignments;
};

// Create sample attendance
const createAttendance = async (subjects, students) => {
  console.log('Creating sample attendance...');
  
  const attendance = [
    {
      date: new Date('2023-11-01'),
      subject: subjects[0]._id,
      class: '10A',
      academicYear: '2023-24',
      term: '1',
      records: [
        {
          student: students.student1._id,
          status: 'present',
          recordedBy: subjects[0].teacher
        },
        {
          student: students.student2._id,
          status: 'absent',
          remarks: 'Sick leave',
          recordedBy: subjects[0].teacher
        }
      ]
    },
    {
      date: new Date('2023-11-02'),
      subject: subjects[1]._id,
      class: '10A',
      academicYear: '2023-24',
      term: '1',
      records: [
        {
          student: students.student1._id,
          status: 'present',
          recordedBy: subjects[1].teacher
        },
        {
          student: students.student2._id,
          status: 'present',
          recordedBy: subjects[1].teacher
        }
      ]
    }
  ];
  
  const createdAttendance = await Attendance.insertMany(attendance);
  return createdAttendance;
};

// Create sample results
const createResults = async (subjects, students) => {
  console.log('Creating sample results...');
  
  const results = [
    {
      student: students.student1._id,
      class: '10A',
      academicYear: '2023-24',
      term: '1',
      examResults: [
        {
          examType: 'midterm',
          subject: subjects[0]._id,
          marksObtained: 85,
          maxMarks: 100,
          grade: 'A',
          published: true
        },
        {
          examType: 'midterm',
          subject: subjects[1]._id,
          marksObtained: 78,
          maxMarks: 100,
          grade: 'B+',
          published: true
        }
      ],
      isPublished: true,
      publishedAt: new Date('2023-10-30'),
      publishedBy: subjects[0].teacher
    },
    {
      student: students.student2._id,
      class: '10A',
      academicYear: '2023-24',
      term: '1',
      examResults: [
        {
          examType: 'midterm',
          subject: subjects[0]._id,
          marksObtained: 92,
          maxMarks: 100,
          grade: 'A+',
          published: true
        },
        {
          examType: 'midterm',
          subject: subjects[1]._id,
          marksObtained: 88,
          maxMarks: 100,
          grade: 'A',
          published: true
        }
      ],
      isPublished: true,
      publishedAt: new Date('2023-10-30'),
      publishedBy: subjects[0].teacher
    }
  ];
  
  const createdResults = await Result.insertMany(results);
  return createdResults;
};

// Main function to run the seeder
const seedDatabase = async () => {
  try {
    // Clear existing data
    await clearData();
    
    // Create sample data
    const users = await createUsers();
    const students = await createStudents(users);
    const teachers = await createTeachers(users);
    const subjects = await createSubjects(teachers);
    await createAssignments(subjects, students);
    await createAttendance(subjects, students);
    await createResults(subjects, students);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();
