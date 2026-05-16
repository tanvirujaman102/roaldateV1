# RoalDate - Setup Instructions

## Prerequisites
- Node.js 18+
- MongoDB
- Redis (optional - app runs without it)

## Backend Setup

```bash
cd backend
npm install
# Copy .env and fill in your credentials
cp .env .env.local
# Start development server
npm run dev
```

## Frontend Setup

```bash
cd frontend
npm install
# Start development server
npm run dev
```

## Environment Variables (Backend .env)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens (change in production!)
- `FRONTEND_URL` - Frontend URL for email links (default: http://localhost:3000)
- All other services (Cloudinary, Twilio, Stripe, etc.) are optional for basic functionality

## Known Issues Fixed
1. Report model missing import in chatController
2. Avatar virtual field added to User model
3. Route ordering fixed (static routes before dynamic /:id routes)
4. ObjectId comparison fixed in chatController
5. VAPID env var name corrected (VAPID_SUBJECT)
6. Redis v4 API compatibility fixed
7. OAuth passport.js field names corrected
8. savedPosts field added to User model
9. UserSubscription import added to walletController
10. Frontend API endpoints corrected
11. Auth token field mapping fixed (tokens.accessToken)
