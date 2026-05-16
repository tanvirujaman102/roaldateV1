<<<<<<< HEAD
# RoalDate - Professional Social Media Platform

A comprehensive social media platform that integrates features from modern social media, messenger, dating apps, and random video chat platforms.

## 🚀 Features

### Core Features
- **User Authentication** - Email/password, Google OAuth, Facebook OAuth, 2FA support
- **Social Media Feed** - Posts, stories, reels, likes, comments, shares
- **Real-time Messaging** - Private chat, group chat, broadcast messages
- **Dating System** - Swipe interface, matching algorithm, super likes
- **Random Video Chat** - WebRTC-based video calling with strangers
- **User Profiles** - Comprehensive profiles with photos, bio, interests
- **Wallet & Payments** - Token system, creator earnings, subscriptions
- **Notifications** - Push notifications, in-app alerts, email notifications
- **Party Rooms** - Group voice and video chat rooms
- **Admin Panel** - Complete management dashboard

### Authentication Features
- ✅ Email & Password Login
- ✅ Google OAuth Integration
- ✅ Facebook OAuth Integration
- ✅ Two-Factor Authentication (2FA)
- ✅ Email Verification
- ✅ Phone Verification
- ✅ Password Reset
- ✅ JWT Token Management
- ✅ Session Persistence

## 🛠 Tech Stack

### Frontend (Web)
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Redux Toolkit** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animations and transitions
- **React Hook Form** - Form handling with validation
- **Axios** - HTTP client with interceptors
- **Socket.io Client** - Real-time communication
- **Heroicons** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.io** - Real-time WebSocket server
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Redis** - In-memory cache
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **nodemailer** - Email service
- **Twilio** - SMS service
- **Cloudinary** - Cloud storage

### Mobile (Future)
- **React Native** - Cross-platform mobile development
- **Expo** - React Native platform

## 📁 Project Structure

```
RoalDate/
├── frontend/                 # Next.js web application
│   ├── app/                 # App Router pages
│   │   ├── login/           # Login page
│   │   ├── signup/          # Registration page
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Dashboard
│   │   └── globals.css      # Global styles
│   ├── components/          # Reusable UI components
│   ├── store/              # Redux store configuration
│   │   └── slices/         # Redux slices
│   ├── services/           # API services
│   └── utils/             # Utility functions
├── backend/                 # Node.js API server
│   ├── controllers/        # Route controllers
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   ├── services/           # Business logic
│   ├── config/             # Configuration files
│   ├── utils/             # Utility functions
│   ├── server.js           # Server entry point
│   └── package.json       # Dependencies
├── mobile/                 # React Native app (future)
├── admin/                  # Admin panel (future)
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB
- Redis
- Google OAuth Client ID (optional)
- Facebook App ID (optional)

### Environment Variables

#### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/roaldate
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd RoalDate
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Start MongoDB and Redis**
```bash
# Start MongoDB
mongod

# Start Redis
redis-server
```

5. **Run the backend server**
```bash
cd backend
npm run dev
```

6. **Run the frontend development server**
```bash
cd frontend
npm run dev
```

7. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔐 Authentication System

### Features Implemented
- **User Registration** with email verification
- **User Login** with email/password
- **Social Login** via Google and Facebook
- **Two-Factor Authentication** using TOTP
- **Password Reset** via email
- **Session Management** with JWT tokens
- **Token Refresh** mechanism
- **Protected Routes** with middleware

### API Endpoints

#### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/oauth/google` - Google OAuth
- `POST /api/auth/oauth/facebook` - Facebook OAuth
- `GET /api/auth/verify-email` - Email verification
- `POST /api/auth/resend-email-verification` - Resend verification
- `POST /api/auth/send-phone-verification` - Send SMS code
- `POST /api/auth/verify-phone` - Verify phone number
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/setup-2fa` - Setup 2FA
- `POST /api/auth/verify-2fa` - Verify and enable 2FA
- `POST /api/auth/disable-2fa` - Disable 2FA
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check-token` - Check token validity
- `GET /api/auth/me` - Get current user info

### Frontend Components

#### Authentication Pages
- **Login Page** (`/login`) - Email/password and social login
- **Signup Page** (`/signup`) - Multi-step registration with validation
- **Dashboard** (`/`) - Main authenticated user interface

#### State Management
- **Redux Store** with persistent auth state
- **Auth Slice** handles all authentication actions
- **API Services** for backend communication

## 🎨 UI/UX Features

### Design System
- **Dark Theme** by default
- **Glass Morphism** effects
- **Smooth Animations** with Framer Motion
- **Responsive Design** for all screen sizes
- **Accessibility** features (ARIA labels, keyboard navigation)

### Components
- **Form Validation** with real-time feedback
- **Password Strength** indicator
- **Loading States** and spinners
- **Toast Notifications** for user feedback
- **Modal System** for overlays
- **Custom Scrollbars** for better UX

## 🔧 Development

### Scripts

#### Backend
```bash
npm start          # Production server
npm run dev        # Development with nodemon
npm test           # Run tests
npm run seed       # Seed database
```

#### Frontend
```bash
npm run dev        # Development server
npm run build      # Production build
npm start          # Production server
npm run lint       # ESLint
npm run type-check # TypeScript check
```

### Code Quality
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Git Hooks** for pre-commit checks

## 🚀 Deployment

### Production Build
1. Build frontend: `npm run build`
2. Start backend: `npm start`
3. Configure reverse proxy (Nginx/Apache)
4. Set up SSL certificates
5. Configure environment variables

### Docker Support (Future)
- Dockerfile for containerization
- Docker Compose for multi-service setup
- Kubernetes deployment files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@roaldate.com
- Documentation: [Wiki](https://github.com/roaldate/wiki)

## 🗺 Roadmap

### Phase 1 (Current)
- ✅ Basic authentication system
- ✅ User profiles
- ✅ Social media feed
- 🔄 Real-time messaging
- 🔄 Dating system

### Phase 2 (Upcoming)
- Random video chat
- Wallet and payments
- Push notifications
- Mobile app development

### Phase 3 (Future)
- Party rooms
- Advanced admin panel
- AI-powered features
- International expansion

---

**Built with ❤️ by the RoalDate Team**
=======
# roaldateV1
Its my frist project
>>>>>>> a6fa7ed7e04190f053b2afc43c28a72e1c1cf760
