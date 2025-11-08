<<<<<<< HEAD
# EduTrack Backend

A comprehensive backend server for the EduTrack Student Information System built with Node.js, Express, and MongoDB.

## Features

- **Role-based Authentication**: Support for Students, Teachers, and Parents
- **Secure Authentication**: JWT tokens, bcrypt password hashing, session management
- **reCAPTCHA Integration**: Bot protection for registration and login
- **Remember Me**: Extended session management with secure tokens
- **Email Verification**: Account verification system
- **Password Reset**: Secure password reset functionality
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive form validation
- **Database Models**: MongoDB schemas for all user types
- **API Documentation**: RESTful API endpoints

## Tech Stack

- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: express-validator
- **CAPTCHA**: Google reCAPTCHA v2

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EduTrack_M
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example config
   cp config.example.js .env
   
   # Edit the configuration with your values
   nano .env
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in your .env file
   ```

5. **Start the server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000` by default.

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `GET /api/auth/verify-email/:token` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users

- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `PUT /api/users/:id/password` - Change password
- `DELETE /api/users/:id` - Deactivate account

### Students

- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `GET /api/students/user/:userId` - Get student by user ID
- `PUT /api/students/:id` - Update student profile
- `POST /api/students/:id/parents` - Add parent to student
- `PUT /api/students/:id/medical` - Update medical information

### Teachers

- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/:id` - Get teacher by ID
- `GET /api/teachers/user/:userId` - Get teacher by user ID
- `PUT /api/teachers/:id` - Update teacher profile
- `POST /api/teachers/:id/performance` - Add performance rating
- `POST /api/teachers/:id/classes` - Assign classes

### Parents

- `GET /api/parents` - Get all parents
- `GET /api/parents/:id` - Get parent by ID
- `GET /api/parents/user/:userId` - Get parent by user ID
- `PUT /api/parents/:id` - Update parent profile
- `POST /api/parents/:id/students` - Add student to parent
- `PUT /api/parents/:id/contact-preferences` - Update contact preferences

## Database Models

### User Model
- Basic profile information
- Authentication data
- Role-based access control
- Email verification
- Password reset functionality

### Student Model
- Academic information (grade, class, section)
- Parent/guardian relationships
- Medical information
- Transportation details
- Emergency contacts

### Teacher Model
- Professional information (department, subjects)
- Qualifications and experience
- Class assignments
- Performance ratings
- Administrative details

### Parent Model
- Family information
- Student relationships
- Contact preferences
- Emergency contacts
- Volunteering interests

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure authentication tokens
- **Session Management**: Express sessions with secure cookies
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive form validation
- **CORS Protection**: Cross-origin resource sharing
- **Helmet Security**: HTTP security headers
- **reCAPTCHA**: Bot protection

## Environment Variables

```javascript
// Server Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3000

// Database
MONGODB_URI=mongodb://localhost:27017/edutrack

// Security
SESSION_SECRET=your-super-secret-session-key
JWT_SECRET=your-super-secret-jwt-key

// reCAPTCHA
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
RECAPTCHA_SITE_KEY=your-recaptcha-site-key

// Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
```

## Development

### Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
```

### Project Structure

```
EduTrack_M/
├── models/           # Database models
│   ├── User.js
│   ├── Student.js
│   ├── Teacher.js
│   └── Parent.js
├── routes/           # API routes
│   ├── auth.js
│   ├── users.js
│   ├── students.js
│   ├── teachers.js
│   └── parents.js
├── server.js         # Main server file
├── package.json      # Dependencies and scripts
├── config.example.js # Configuration template
└── README.md         # This file
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Use strong session and JWT secrets
3. Configure MongoDB Atlas or secure MongoDB instance
4. Set up proper CORS origins
5. Enable HTTPS
6. Configure email service for notifications
7. Set up monitoring and logging
8. Configure reverse proxy (nginx)
9. Set up SSL certificates
10. Configure firewall rules

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
=======
# EduTrack_M
A web-based Student Information Management System built with HTML, CSS, and JavaScript. EduTrack helps college students, teachers, and parents manage academic activities — including schedules, assignments, results, and fees — all in one responsive platform.
>>>>>>> 675f0b6c194fd57dab91215e9c92cf749df19c9c
