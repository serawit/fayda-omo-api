import './config/env.js'; // Must be the first import to load env vars before other modules
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes.js'; // Note the .js extension for ESM/TSX
import harmonizationRoutes from './routes/harmonization.routes.js';
import { handleCallback } from './controllers/auth.controller.js';
import cbsRoutes from './routes/cbs.routes.js';
import { compareProfiles } from './services/comparison.service.js'; // Using the actual comparison service
import { initializeOracle, closeOracle } from './oracle.js';
import { initSmpp, sendSmsSMPP, closeSmpp } from './services/smpp.service.js';

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

// Parse and clean additional allowed origins from the .env file.
// Example in .env file: ALLOWED_ORIGINS=http://197.156.123.4:3000,http://another.domain.com
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim()) // Trim whitespace from each origin
  .filter(Boolean); // Remove any empty strings that might result from trailing commas, etc.

app.use(cors({
  origin: [
    // Core URLs can be defined here or in environment variables.
    process.env.FRONTEND_URL,      // The main production frontend URL from .env
    'https://fayda.omobanksc.com', // Production domain
    'http://fayda.omobanksc.com',  // Production domain (HTTP, if behind a proxy)

    // Development-specific URLs
    'http://localhost:3000',       // Local React development
    'http://localhost:5173',       // Local Vite development
    ...allowedOrigins
  ].filter(Boolean), // Filter out any undefined/empty values from the final array
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

const isCookieSecure = process.env.COOKIE_SECURE === 'true';

// Session Configuration
app.use(session({
  secret: process.env.JWT_SECRET || 'fallback-secret-key-change-in-prod',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: mongoUri,
    collectionName: 'sessions', // Optional: defaults to 'sessions'
    ttl: 60 * 60 // Session expiration in seconds (1 hour)
  }),
  cookie: {
    secure: isCookieSecure, // Only use secure cookies if explicitly enabled (for HTTPS)
    httpOnly: true,
    maxAge: 1000 * 60 * 15, // 15 minutes
    sameSite: 'lax', // Recommended for OIDC redirects
    rolling: true // Refreshes the cookie expiration on every response
  }
}));

// --- Presentation Demo Route ---
// This endpoint simulates the entire harmonization flow with mock data for presentation purposes.
// It demonstrates the process from receiving a Fayda profile to sending an OTP.
app.get('/api/test/presentation-demo', async (req: Request, res: Response) => {
  console.log('\n--- 🎬 Starting Presentation Demo Flow ---');

  // 1. Simulate receiving a profile from Fayda after a successful user login.
  const mockFaydaProfile = {
    uid: '1234567890123456',
    name: 'Abebe Bikila',
    gender: 'Male',
    phone: '251911223344',
    dob: '1932-08-07',
  };
  console.log('STEP 1: Received mock profile from Fayda:', mockFaydaProfile);

  // 2. Simulate fetching the corresponding customer from Omo Bank's Core Banking System (CBS).
  // In a real scenario, this would involve a DB query. Here, we use a hardcoded mock profile
  // to show how the system handles slight data variations.
  const mockCbsProfile = {
    accountNumber: '1000123456789',
    fullName: 'Mr. Abebe T. Bikila', // Note the slight name difference
    gender: 'M', // Note the different format ('M' vs 'Male')
    primaryPhone: '911223344', // Note the missing country code
  };
  console.log('STEP 2: Fetched mock profile from Core Banking System:', mockCbsProfile);

  // 3. Simulate the Harmonization/Comparison Logic to find a match.
  console.log('STEP 3: Comparing the two profiles using fuzzy logic...');
  // We now use the actual comparison service for a more realistic demonstration.
  const comparisonResult = compareProfiles(mockFaydaProfile, mockCbsProfile);
  console.log(`  - Comparison Score: ${comparisonResult.matchScore}%`);

  if (comparisonResult.isMatch) {
    console.log('  - ✅ RESULT: Profiles are a match based on service logic.');
  } else {
    console.log('  - ❌ RESULT: Profiles do not meet the match criteria.');
  }

  if (comparisonResult.isMatch) {
    // 4. If a match is found, generate and "send" an OTP to the phone number from the bank's records.
    console.log('STEP 4: Generating and sending OTP for final verification...');
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    const targetPhone = `251${mockCbsProfile.primaryPhone.slice(-9)}`;

    // For the presentation, we log to the console instead of calling the real SMS service.
    console.log(`  - 📲 SIMULATION: "Sent" OTP [${otp}] to phone number ${targetPhone}`);
    console.log('--- ✅ Presentation Demo Flow Complete ---');

    res.json({
      success: true,
      message: 'Harmonization successful. OTP sent for final verification.',
      action: `Please enter the OTP sent to your registered phone number ending in ******${mockCbsProfile.primaryPhone.slice(-4)}`,
      _for_demo_only_otp: otp, // Included for easy testing during the presentation
    });
  } else {
    console.log('--- ❌ Presentation Demo Flow Failed ---');
    res.status(404).json({
      success: false,
      message: 'Could not find a matching bank account for the provided Fayda profile.',
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/harmonization', harmonizationRoutes);
app.use('/api/cbs', cbsRoutes);

// Handle the production callback URL specifically (outside /api/auth prefix)
app.get('/auth/fayda/callback', handleCallback);

// Temporary SMS Test Route
app.get('/test-sms', async (req: Request, res: Response) => {
  const phone = req.query.phone as string || '251911223344';
  const msg = req.query.msg as string || 'Test SMS from Omo Bank API';
  try {
    const messageId = await sendSmsSMPP(phone, msg);
    res.json({ success: true, messageId, to: phone });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'Operational',
    service: 'Fayda Omo Bank API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
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

const startServer = async () => {
  try {
    // Establish connections first to prevent race conditions
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    if (process.env.MOCK_MODE === 'true') {
      console.log('⚠️  MOCK_MODE enabled: Skipping Oracle and SMPP connections.');
    } else {
      await initializeOracle();

      // Initialize SMS Gateway Connection
      initSmpp();
    }

    // Now that DBs are ready, start the server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server listening on port ${PORT}.`);
      if (process.env.NODE_ENV === 'production') {
        console.log(`   Public URL: https://fayda.omobanksc.com`);
      }
      console.log(`   Local URL:  http://localhost:${PORT} or your LAN IP.`);
      console.log(`(Time in Addis Ababa: ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Addis_Ababa' })})`);
      console.log(`   Cookie Secure Mode: ${isCookieSecure ? 'ON (HTTPS required)' : 'OFF (HTTP allowed)'}`);
    });

    // Graceful Shutdown: Close DB connection properly when server stops
    const gracefulShutdown = (signal: string) => {
      console.log(`\n${signal} signal received. Closing HTTP server...`);
      server.close(async () => {
        console.log('HTTP server closed.');
        
        if (process.env.MOCK_MODE !== 'true') {
          try {
            await closeOracle();
            console.log('Oracle connection closed.');
          } catch (err) {
            console.error('Error closing Oracle connection:', err);
          }
        }

        mongoose.connection.close(false).then(() => {
          console.log('MongoDB connection closed. Exiting.');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();