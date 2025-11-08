module.exports = {
  // Server Configuration
  NODE_ENV: 'development',
  PORT: 3000,
  FRONTEND_URL: 'http://localhost:3000',
  
  // Database Configuration
  MONGODB_URI: 'mongodb://localhost:27017/edutrack',
  
  // Security Configuration
  SESSION_SECRET: 'your-super-secret-session-key-change-in-production',
  JWT_SECRET: 'your-super-secret-jwt-key-change-in-production',
  
  // reCAPTCHA Configuration
  RECAPTCHA_SECRET_KEY: 'your-recaptcha-secret-key',
  RECAPTCHA_SITE_KEY: 'your-recaptcha-site-key',
  
  // Email Configuration (Optional - for email verification and notifications)
  EMAIL_HOST: 'smtp.gmail.com',
  EMAIL_PORT: 587,
  EMAIL_USER: 'your-email@gmail.com',
  EMAIL_PASS: 'your-email-password',
  EMAIL_FROM: 'EduTrack <noreply@edutrack.com>',
  
  // File Upload Configuration
  MAX_FILE_SIZE: 10485760, // 10MB
  UPLOAD_PATH: './uploads',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: 900000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  AUTH_RATE_LIMIT_MAX_REQUESTS: 5,
  
  // Logging
  LOG_LEVEL: 'info',
  LOG_FILE: './logs/app.log'
};
