const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import config
const config = require('./config');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const studentRoutes = require('./routes/students');
const teacherRoutes = require('./routes/teachers');
const parentRoutes = require('./routes/parents');

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: config.cors.origin,
    methods: config.cors.methods,
    credentials: true
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Join room for private messages
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://unpkg.com", "https://www.google.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https://www.google.com"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Auth rate limiting (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/', authLimiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'edutrack-session-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: 'lax'
  },
  name: 'edutrack.sid' // Change default session name for security
}));

// Serve static files from root directory first
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'public')));

// Set MIME type for JavaScript files
app.use((req, res, next) => {
  if (req.url.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript');
  }
  next();
});

// In-memory store for captchas (use Redis in production)
const captchaStore = new Map();

// Generate a random string for CAPTCHA
function generateCaptchaText(length = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnopqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Generate CAPTCHA image
app.get('/api/captcha', (req, res) => {
    const canvas = createCanvas(200, 80);
    const ctx = canvas.getContext('2d');
    
    // Generate random text
    const text = generateCaptchaText();
    const id = crypto.randomBytes(16).toString('hex');
    
    // Store the CAPTCHA text with expiration (5 minutes)
    captchaStore.set(id, {
        text: text,
        expires: Date.now() + 300000 // 5 minutes
    });
    
    // Clean up old CAPTCHAs
    captchaStore.forEach((value, key) => {
        if (value.expires < Date.now()) {
            captchaStore.delete(key);
        }
    });

    // Draw background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw text with distortion
    ctx.fillStyle = '#2d3748';
    ctx.font = 'bold 40px Arial';
    
    // Add distortion to text
    for (let i = 0; i < text.length; i++) {
        const x = 20 + i * 30;
        const y = 50 + Math.sin(Date.now() / 1000 + i) * 5;
        
        // Random rotation
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((Math.random() - 0.5) * 0.4);
        
        // Random color variation
        const hue = 200 + Math.random() * 40 - 20;
        ctx.fillStyle = `hsl(${hue}, 70%, 30%)`;
        
        ctx.fillText(text[i], 0, 0);
        ctx.restore();
    }
    
    // Add noise
    for (let i = 0; i < 100; i++) {
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.1})`;
        ctx.fillRect(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 2,
            Math.random() * 2
        );
    }
    
    // Add some lines
    for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = `rgba(0, 0, 0, ${Math.random() * 0.2})`;
        ctx.beginPath();
        ctx.moveTo(
            Math.random() * canvas.width,
            Math.random() * canvas.height
        );
        ctx.bezierCurveTo(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * canvas.width,
            Math.random() * canvas.height
        );
        ctx.stroke();
    }
    
    // Send the image
    res.set('Content-Type', 'image/png');
    res.set('X-Captcha-Id', id);
    canvas.createPNGStream().pipe(res);
});

// Verify CAPTCHA
app.post('/api/verify-captcha', (req, res) => {
    const { id, text } = req.body;
    
    if (!id || !text) {
        return res.status(400).json({ success: false, message: 'Missing captcha ID or text' });
    }
    
    const captcha = captchaStore.get(id);
    
    // Remove the captcha after verification (one-time use)
    captchaStore.delete(id);
    
    if (!captcha) {
        return res.status(404).json({ success: false, message: 'Captcha not found or expired' });
    }
    
    if (captcha.expires < Date.now()) {
        return res.status(400).json({ success: false, message: 'Captcha expired' });
    }
    
    const isMatch = text.toLowerCase() === captcha.text.toLowerCase();
    
    res.json({
        success: isMatch,
        message: isMatch ? 'CAPTCHA verified' : 'Incorrect CAPTCHA'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/parents', parentRoutes);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutrack', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'student-dashboard.html'), (err) => {
        if (err) {
            console.error('❌ Error sending student dashboard:', err);
            res.status(500).send('Error loading dashboard');
        }
    });
});

app.get('/teacher-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'teacher-dashboard.html'), (err) => {
        if (err) {
            console.error('❌ Error sending teacher dashboard:', err);
            res.status(500).send('Error loading teacher dashboard');
        }
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use('*', (req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation Error', details: err.message });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate entry', field: Object.keys(err.keyValue)[0] });
  }
  
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutrack', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 EduTrack server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3001'}`);
}).on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
