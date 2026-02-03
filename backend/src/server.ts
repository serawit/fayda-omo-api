import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes.js'; // Note the .js extension for ESM/TSX
import harmonizationRoutes from './routes/harmonization.routes.js';
import userRoutes from './routes/user.routes.js';
import { handleCallback } from './controllers/auth.controller.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import otpRoutes from './routes/otp.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { initCronJobs } from './services/cron.js';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Validate critical environment variables
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET is not defined in production environment.');
  process.exit(1);
}
if (!process.env.FAYDA_API_KEY) {
  console.warn('⚠️ WARNING: FAYDA_API_KEY is missing. NID Sync features will fail.');
  // In strict production, you might want to process.exit(1) here too
}

const app = express();
const PORT = process.env.PORT || 5000;
app.set('trust proxy', 1); // Trust Nginx to handle HTTPS/SSL

// Middleware
app.use(helmet({
  crossOriginOpenerPolicy: false, // Disable COOP to allow HTTP/LAN access without warnings
}));
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'https://fayda.omobanksc.com',
    'http://10.11.0.59:3000',
    'http://10.11.0.59:5173',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ].filter((origin): origin is string => !!origin),
  credentials: true // Important for sessions/cookies
}));
app.use(express.json());
app.use(rateLimit({  // Basic DoS protection
  windowMs: 15 * 60 * 1000,  // 15 min
  max: 1000  // Increased limit for development
}));
app.use(express.urlencoded({ extended: true }));

// Database Connection String
const mongoUri = process.env.MONGO_URI || process.env.DB_URI || 'mongodb://127.0.0.1:27017/fayda-omo';

// Session Configuration
app.use(session({
  secret: process.env.JWT_SECRET || 'fallback-secret-key-change-in-prod',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: mongoUri,
    collectionName: 'sessions', // Optional: defaults to 'sessions'
    ttl: 14 * 24 * 60 * 60 // Optional: Session expiration in seconds (14 days)
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (requires HTTPS)
    httpOnly: true,
    maxAge: 1000 * 60 * 15, // 15 minutes
    sameSite: 'lax' // Recommended for OIDC redirects
  }
}));

// Database Connection
mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    initCronJobs();
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/harmonization', harmonizationRoutes);
app.use('/api/user', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/otp', otpRoutes);

// Handle the production callback URL specifically (outside /api/auth prefix)
app.get('/auth/fayda/callback', handleCallback);

// Test route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Fayda-Omo API backend rebuilt from scratch! 🚀' });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('🔥 Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server listening on port ${PORT}.`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`   Public URL: https://fayda.omobanksc.com`);
  }
  console.log(`   Local URL:  http://localhost:${PORT} or your LAN IP.`);
  console.log(`(Time in Addis Ababa: ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Addis_Ababa' })})`);
});

// Graceful Shutdown: Close DB connection properly when server stops
const gracefulShutdown = (signal: string) => {
  console.log(`\n${signal} signal received. Closing HTTP server...`);
  server.close(() => {
    console.log('HTTP server closed.');
    mongoose.connection.close(false).then(() => {
      console.log('MongoDB connection closed. Exiting.');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));