const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const redis = require('redis');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.IO Setup
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? 
      ['https://roaldate.com', 'https://www.roaldate.com'] : 
      ['http://localhost:3000', 'http://localhost:19006'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io available to other modules
app.set('io', io);

// Database Connections
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Redis Connection (optional - server continues if Redis unavailable)
let redisClient = null;

const connectRedis = async () => {
  try {
    const client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries >= 3) return false; // Stop after 3 attempts
          return 1000; // Wait 1 second between retries
        },
        connectTimeout: 3000
      }
    });

    client.on('error', () => {}); // Suppress repeated error logs
    client.on('connect', () => console.log('✅ Redis Connected'));

    await client.connect();
    redisClient = client;
  } catch (err) {
    console.warn('⚠️ Redis unavailable — server running without cache (Redis optional)');
  }
};

connectRedis();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "wss:", "ws:"],
      mediaSrc: ["'self'", "blob:"],
    },
  },
}));

app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS Configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 
    ['https://roaldate.com', 'https://www.roaldate.com'] : 
    ['http://localhost:3000', 'http://localhost:19006'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const chatRoutes = require('./routes/chat');
const videoChatRoutes = require('./routes/videoChat');
const datingRoutes = require('./routes/dating');
const walletRoutes = require('./routes/wallet');
const notificationRoutes = require('./routes/notification');
const partyRoutes = require('./routes/party');
const adminRoutes = require('./routes/admin');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/video-chat', videoChatRoutes);
app.use('/api/dating', datingRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/party', partyRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Socket.IO Connection Handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log(`🔗 User connected: ${socket.id}`);

  // User joins with their userId
  socket.on('join', (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined with socket ${socket.id}`);
  });

  // Handle typing indicators
  socket.on('typing', ({ chatId, isTyping }) => {
    socket.to(chatId).emit('user_typing', {
      userId: socket.userId,
      isTyping
    });
  });

  // Handle real-time messaging
  socket.on('send_message', async (data) => {
    const { chatId, message, receiverId } = data;
    
    // Send to receiver if online
    const receiverSocketId = connectedUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('new_message', {
        chatId,
        message,
        senderId: socket.userId
      });
    }
  });

  // Handle video chat signaling
  socket.on('video_call_signal', (data) => {
    const { targetUserId, signal, callType } = data;
    const targetSocketId = connectedUsers.get(targetUserId);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('incoming_call_signal', {
        signal,
        callerId: socket.userId,
        callType
      });
    }
  });

  // Handle random video chat
  socket.on('join_random_chat', (preferences) => {
    socket.join('random_chat_pool');
    socket.preferences = preferences;
    
    // Try to find a match
    const availableUsers = Array.from(io.sockets.adapter.rooms.get('random_chat_pool') || [])
      .filter(id => id !== socket.id);
    
    if (availableUsers.length > 0) {
      const matchId = availableUsers[Math.floor(Math.random() * availableUsers.length)];
      socket.emit('random_chat_match', { matchedUserId: matchId });
      io.to(matchId).emit('random_chat_match', { matchedUserId: socket.id });
    }
  });

  // Handle party room
  socket.on('join_party', (partyId) => {
    socket.join(`party_${partyId}`);
    socket.to(`party_${partyId}`).emit('user_joined_party', {
      userId: socket.userId,
      socketId: socket.id
    });
  });

  socket.on('leave_party', (partyId) => {
    socket.leave(`party_${partyId}`);
    socket.to(`party_${partyId}`).emit('user_left_party', {
      userId: socket.userId,
      socketId: socket.id
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      console.log(`👋 User ${socket.userId} disconnected`);
    }
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 
      'Something went wrong!' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 RoalDate Backend Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for connections`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

module.exports = { app, server, io };
