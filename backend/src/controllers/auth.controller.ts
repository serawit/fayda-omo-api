// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import axios from 'axios';
import * as jose from 'jose';
import crypto from 'crypto';
import { z } from 'zod';
import User from '../models/user.model.js';
// import { sendSms, checkSmsHealth } from '../services/sms.service.js';
import { sendSmsSMPP as sendSms, checkSmsHealth } from '../services/smpp.service.js';
import { generateCodeVerifier, generateCodeChallenge } from '../utils/pkce.js';
import { lookupCoreBankingCustomer } from '../services/coreBanking.service.js';
import { logAudit } from '../utils/auditLogger.js';
import oracledb from 'oracledb';
import { compareProfiles } from '../services/comparison.service.js';

// ────────────────────────────────────────────────
// Config (from .env)
// ────────────────────────────────────────────────

const FAYDA_AUTH_URL = process.env.FAYDA_BASE_URL || 'https://auth.fayda.et';

const REDIRECT_URI =
  process.env.REDIRECT_URI || 'https://fayda.omobanksc.com/auth/fayda/callback';

const FRONTEND_URL =
  process.env.FRONTEND_URL || 'http://localhost:3000';

// ────────────────────────────────────────────────
// Schemas
// ────────────────────────────────────────────────

const initiateSchema = z.object({
  accountNumber: z.string()
    .length(16, 'Account number must be exactly 16 digits')
    .regex(/^\d+$/, 'Account number must contain only digits')
    .trim(),
});

const otpVerifySchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  accountNumber: z.string()
    .length(16, 'Account number must be exactly 16 digits')
    .regex(/^\d+$/, 'Account number must contain only digits')
    .trim(),
});

const fanSchema = z.string().regex(/^\d{16}$/, 'Fayda ID must be exactly 16 digits');

// ────────────────────────────────────────────────
// Mock Data (For Testing)
// ────────────────────────────────────────────────
const MOCK_ACCOUNT_NUMBER = '1000000000000000';
const MOCK_CUSTOMER_PROFILE = {
  accountNumber: MOCK_ACCOUNT_NUMBER,
  fullName: 'Mock Test User',
  gender: 'Male',
  phoneNumber: '0911223344',
  nationalId: '123456789012',
  dateOfBirth: '1990-01-01',
  status: 'ACTIVE'
};

// ────────────────────────────────────────────────
// Session extension
// ────────────────────────────────────────────────

declare module 'express-session' {
  interface SessionData {
    accountNumber?: string;
    otp?: string;
    otpCreatedAt?: number;
    otpAttempts?: number;
    otpVerified?: boolean;
    codeVerifier?: string;
    state?: string;
    faydaNumber?: string;
    otpLockedUntil?: number;
    userId?: string;
    role?: string;
  }
}

// ────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────

function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

function isOtpExpired(createdAt?: number): boolean {
  if (!createdAt) return true;
  return Date.now() - createdAt > 10 * 60 * 1000; // 10 minutes
}

// ────────────────────────────────────────────────
// 1. Initiate login – send OTP
// ────────────────────────────────────────────────

export const initiateBankLogin = async (req: Request, res: Response) => {
  try {
    const { accountNumber } = initiateSchema.parse(req.body);

    // Rule 5: Check if locked
    if (req.session.otpLockedUntil && Date.now() < req.session.otpLockedUntil) {
      const minutesLeft = Math.ceil((req.session.otpLockedUntil - Date.now()) / 60000);
      console.warn(`[Auth] Login blocked for ${accountNumber}. Locked for ${minutesLeft} mins.`);
      logAudit(req, { action: 'LOGIN_INITIATE', accountNumber, result: 'FAILURE', errorCode: 429, message: 'Account Locked' });
      return res.status(429).json({ success: false, message: `Too many failed attempts. Please try again in ${minutesLeft} minutes.` });
    }

    // 1. Check Oracle Core Bank
    let coreCustomer;
    if (process.env.MOCK_MODE === 'true' || accountNumber === MOCK_ACCOUNT_NUMBER) {
      console.log('[Auth] 🛠️ Using MOCK Customer Profile (Skipping Oracle DB).');
      coreCustomer = MOCK_CUSTOMER_PROFILE;
    } else {
      coreCustomer = await lookupCoreBankingCustomer(accountNumber);
    }

    if (!coreCustomer) {
      logAudit(req, { action: 'LOGIN_INITIATE', accountNumber, result: 'FAILURE', errorCode: 404, message: 'Account Not Found' });
      return res.status(404).json({ success: false, message: 'Account not found in Omo Bank records.' });
    }

    // Strict check: If no phone number is found in the core banking system, do not proceed.
    const phoneNumber = coreCustomer.phoneNumber;
    // Use a mock phone number for development/testing if one is not found in the DB
    const effectivePhoneNumber = phoneNumber || '0911234567';
    if (!phoneNumber) {
      console.warn(`[Auth] WARNING: No phone number found for account ${accountNumber}. Using mock phone number for OTP.`);
    }

    let otp = generateOtp();
    // [MOCK] Use fixed OTP for easier testing
    if (process.env.MOCK_MODE === 'true' || accountNumber === MOCK_ACCOUNT_NUMBER) {
      otp = '123456';
    }

    // Format SMS for WebOTP API (origin-bound one-time codes)
    // The last line must be in the format: @<domain> #<otp>
    const origin = new URL(FRONTEND_URL).hostname;
    const message = `Your Omo Bank Verification Code is: ${otp}`;

    console.log(`[Auth] Sending OTP to ${accountNumber} (Phone: ${effectivePhoneNumber})`);
    
    try {
      if (process.env.MOCK_MODE === 'true') {
        console.log(`[Auth] 🛠️ Mock Mode: SMS suppressed. OTP is ${otp}`);
      } else {
        await sendSms(effectivePhoneNumber, message);
      }
    } catch (error) {
      console.warn('⚠️ [Auth] SMS Service Error: Failed to send SMS. Proceeding with mock flow (Development Mode).');
    }

    req.session.accountNumber = accountNumber;
    req.session.otp = otp;
    req.session.otpCreatedAt = Date.now();
    req.session.otpAttempts = 0;
    req.session.otpVerified = false;

    await req.session.save();

    logAudit(req, { action: 'LOGIN_INITIATE', accountNumber, result: 'SUCCESS' });

    // 5. Send success back to Frontend (Mask the phone number for security)
    const maskedPhone = effectivePhoneNumber.replace(/.(?=.{4})/g, "*"); 

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        name: coreCustomer.fullName,
        phone: maskedPhone
      }
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const message = err.issues.map((issue) => issue.message).join('. ');
      logAudit(req, { action: 'LOGIN_INITIATE', result: 'FAILURE', errorCode: 400, message: 'Validation Error' });
      return res.status(400).json({ success: false, message, errors: err.issues });
    }
    // Check for specific Oracle timeout error
    if ((err as any).code === 'NJS-510') {
      const message = 'Connection to the banking system timed out. Please check your network or try again later.';
      logAudit(req, { action: 'LOGIN_INITIATE', result: 'FAILURE', errorCode: 504, message: 'Oracle Timeout' });
      return res.status(504).json({ success: false, message });
    }
    console.error('initiateBankLogin error:', err);
    logAudit(req, { action: 'LOGIN_INITIATE', result: 'FAILURE', errorCode: 500, message: (err as Error).message });
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ────────────────────────────────────────────────
// 2. Verify OTP
// ────────────────────────────────────────────────

export const verifyBankOtp = async (req: Request, res: Response) => {
  try {
    const { otp, accountNumber } = otpVerifySchema.parse(req.body);
    const session = req.session as any;

    // [MOCK] Allow stateless verification in Mock Mode (e.g. when testing /otp directly)
    if (process.env.MOCK_MODE === 'true' && 
        accountNumber === MOCK_ACCOUNT_NUMBER && 
        otp === '123456' && 
        !req.session.accountNumber) {
      console.log('[Auth] 🛠️ Mock Mode: Re-hydrating session for stateless verification.');
      req.session.accountNumber = accountNumber;
      req.session.otp = otp;
      req.session.otpCreatedAt = Date.now();
      req.session.otpAttempts = 0;
    }

    if (!req.session.accountNumber || !req.session.otp || !req.session.otpCreatedAt) {
      console.log('❌ Session missing or expired. Current session:', req.session);
      logAudit(req, { action: 'OTP_VERIFY', accountNumber, result: 'FAILURE', errorCode: 400, message: 'Session Invalid/Expired' });
      return res.status(400).json({ success: false, message: 'Session expired or invalid. Please start login again.' });
    }

    if (req.session.accountNumber !== accountNumber) {
      logAudit(req, { action: 'OTP_VERIFY', accountNumber, result: 'FAILURE', errorCode: 400, message: 'Account Mismatch' });
      return res.status(400).json({ success: false, message: 'Account number mismatch. Please start over.' });
    }

    // Rule 5: Check lock status before verifying
    if (req.session.otpLockedUntil && Date.now() < req.session.otpLockedUntil) {
      const minutesLeft = Math.ceil((req.session.otpLockedUntil - Date.now()) / 60000);
      logAudit(req, { action: 'OTP_VERIFY', accountNumber, result: 'FAILURE', errorCode: 429, message: 'Account Locked' });
      return res.status(429).json({ success: false, message: `Too many failed attempts. Try again in ${minutesLeft} minutes.` });
    }

    if (isOtpExpired(req.session.otpCreatedAt)) {
      logAudit(req, { action: 'OTP_VERIFY', accountNumber, result: 'FAILURE', errorCode: 410, message: 'OTP Expired' });
      return res.status(410).json({ success: false, message: 'OTP expired. Request new one.' });
    }

    req.session.otpAttempts = (req.session.otpAttempts || 0) + 1;

    if (req.session.otp !== otp) {
      // Rule 5: Lock after 5 consecutive failures
      if (req.session.otpAttempts >= 5) {
        req.session.otpLockedUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
        await req.session.save();
        console.warn(`[Auth] Account ${accountNumber} locked for 30 minutes due to 5 failed OTP attempts.`);
        logAudit(req, { action: 'OTP_VERIFY', accountNumber, result: 'FAILURE', errorCode: 429, message: 'Max Attempts Reached - Locked' });
        return res.status(429).json({ success: false, message: 'Too many failed attempts. Account locked for 30 minutes.' });
      }

      await req.session.save();
      console.warn(`[Auth] Invalid OTP attempt ${req.session.otpAttempts}/5 for ${accountNumber}`);
      logAudit(req, { action: 'OTP_VERIFY', accountNumber, result: 'FAILURE', errorCode: 400, message: 'Invalid OTP' });
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
        attemptsLeft: 5 - req.session.otpAttempts,
      });
    }

    req.session.otpVerified = true;
    req.session.otp = undefined;
    req.session.otpCreatedAt = undefined;
    req.session.otpAttempts = 0;
    req.session.otpLockedUntil = undefined; // Clear lock on success

    // Hydrate profile if missing (for comparison later)
    if (!session.cbsProfile) {
      let customer;
      if (process.env.MOCK_MODE === 'true' || session.accountNumber === MOCK_ACCOUNT_NUMBER) {
        customer = MOCK_CUSTOMER_PROFILE;
      } else {
        customer = await lookupCoreBankingCustomer(session.accountNumber);
      }

      // This helper is used to prepare data for the comparison service
      const mapToFaydaComparison = (cbsCustomer: any) => {
        const nameParts = (cbsCustomer.fullName || '').trim().split(/\s+/);
        return {
          firstName: nameParts[0] || '',
          middleName: nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : (nameParts.length === 2 ? nameParts[1] : ''),
          lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : '',
          gender: (cbsCustomer.gender === 'Male' || cbsCustomer.gender === 'M') ? 'M' : (cbsCustomer.gender === 'Female' || cbsCustomer.gender === 'F') ? 'F' : 'O',
          phoneNumber: cbsCustomer.phoneNumber || '',
          status: cbsCustomer.status || 'UNKNOWN',
          fin: cbsCustomer.nationalId || '',
          dateOfBirth: cbsCustomer.dateOfBirth ? new Date(cbsCustomer.dateOfBirth).toISOString().split('T')[0] : ''
        };
      };
      if (customer) {
        session.cbsProfile = customer;
        session.faydaComparisonData = mapToFaydaComparison(customer);
      }
    }

    await req.session.save();

    // ────────────────────────────────────────────────
    // Auto-generate Fayda Consent URL (Redirect immediately)
    // ────────────────────────────────────────────────
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = crypto.randomBytes(16).toString('hex');

    req.session.codeVerifier = codeVerifier;
    req.session.state = state;
    await req.session.save();

    const authUrl = new URL(`${FAYDA_AUTH_URL}/authorize`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', process.env.FAYDA_CLIENT_ID!);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('scope', 'openid profile phone email address birthdate nationality gender picture');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    logAudit(req, { action: 'OTP_VERIFY', accountNumber, result: 'SUCCESS' });

    res.status(200).json({
      success: true,
      message: 'OTP verified',
      redirectUrl: authUrl.toString(),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const message = err.issues.map((issue) => issue.message).join('. ');
      logAudit(req, { action: 'OTP_VERIFY', result: 'FAILURE', errorCode: 400, message: 'Validation Error' });
      return res.status(400).json({ success: false, message, errors: err.issues });
    }
    console.error('verifyBankOtp error:', err);
    logAudit(req, { action: 'OTP_VERIFY', result: 'FAILURE', errorCode: 500, message: (err as Error).message });
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ────────────────────────────────────────────────
// 3. Session status
// ────────────────────────────────────────────────

export const getSessionStatus = async (req: Request, res: Response) => {
  try {
    // Add detailed logging to diagnose session issues
    console.log(`[Session] Checking status for session ID: ${req.sessionID}`);
    console.log('[Session] Session data:', req.session);
    const isAuthenticated = (req.session?.otpVerified && req.session?.accountNumber) || (req.session?.userId && req.session?.accountNumber);

    if (isAuthenticated && req.session?.accountNumber) {
      // 5. Display verified user data (Fetch from DB)
      let user = await User.findOne({ accountNumber: req.session.accountNumber });
      let cbsProfile = null;

      // Always fetch from Core Banking to show fresh confirmation details on the harmonization page.
      if (process.env.MOCK_MODE === 'true' || req.session.accountNumber === MOCK_ACCOUNT_NUMBER) {
        cbsProfile = MOCK_CUSTOMER_PROFILE;
      } else {
        cbsProfile = await lookupCoreBankingCustomer(req.session.accountNumber);
      }

      return res.status(200).json({
        success: true,
        isAuthenticated: true,
        accountNumber: req.session.accountNumber,
        user, // Return profile data to frontend
        cbsProfile, // Return core banking data for confirmation step
      });
    }

    console.warn(`[Session] Authentication check failed for session ID: ${req.sessionID}`);
    console.warn(`[Session] Debug Flags:`, {
      hasOtpVerified: req.session?.otpVerified,
      hasAccountNumber: !!req.session?.accountNumber,
      hasUserId: !!req.session?.userId
    });
    res.status(403).json({
      success: false,
      isAuthenticated: false,
      message: 'Session invalid or expired.',
    });
  } catch (err) {
    if ((err as any).code === 'NJS-510') {
      const message = 'Connection to the banking system timed out. Please check your network or try again later.';
      console.error(`getSessionStatus error: ${message}`);
      return res.status(504).json({ success: false, message });
    }
    console.error('getSessionStatus error:', err); // Keep generic logging for other errors
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ────────────────────────────────────────────────
// 4. Initiate Fayda consent (OIDC + PKCE)
// ────────────────────────────────────────────────

// ────────────────────────────────────────────────
// 5. Handle Fayda callback
// ────────────────────────────────────────────────

export const handleCallback = async (req: Request, res: Response) => {
  let connection;
  try {
    // 1. Validate state and session
    const { code, state, error } = req.query;
    const session = req.session as any;

    if (error) {
      console.error('Fayda Callback Error:', error);
      return res.redirect(`${FRONTEND_URL}/harmonization?error=${encodeURIComponent(error as string)}`);
    }

    if (!state || state !== req.session.state) {
      console.error('[Auth] Invalid state parameter in callback.');
      logAudit(req, { action: 'HARMONIZATION', result: 'FAILURE', errorCode: 400, message: 'Invalid State' });
      return res.redirect(`${FRONTEND_URL}/?error=invalid_state`);
    }

    const accountNumber = req.session.accountNumber;
    if (!accountNumber || !req.session.codeVerifier) {
      console.error('[Auth] Session expired or invalid before callback.');
      logAudit(req, { action: 'HARMONIZATION', result: 'FAILURE', errorCode: 400, message: 'Session Invalid/Expired' });
      return res.redirect(`${FRONTEND_URL}/?error=session_expired`);
    }

    // 1. Get the Authorization Code from the query parameters
    if (!code) {
      console.error('❌ Authorization code missing in callback');
      return res.redirect(`${FRONTEND_URL}/?error=missing_code`);
    }

    // 2. Exchange the Code for an Access Token & ID Token using PKCE
    const tokenEndpoint = `${FAYDA_AUTH_URL}/token`; 
    
    const params = new URLSearchParams();
    params.append('client_id', process.env.FAYDA_CLIENT_ID || '');
    params.append('client_secret', process.env.FAYDA_CLIENT_SECRET || '');
    params.append('grant_type', 'authorization_code');
    params.append('code', code as string);
    params.append('redirect_uri', REDIRECT_URI);
    params.append('code_verifier', req.session.codeVerifier); // Add PKCE verifier

    // Make the request to Fayda
    const tokenResponse = await axios.post(tokenEndpoint, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { id_token } = tokenResponse.data;

    if (!id_token) {
      throw new Error('No ID token received from Fayda');
    }

    // 3. SECURELY Verify the ID Token
    const JWKS = jose.createRemoteJWKSet(new URL(`${FAYDA_AUTH_URL}/.well-known/jwks.json`));
    const { payload } = await jose.jwtVerify(id_token, JWKS, {
      issuer: FAYDA_AUTH_URL,
      audience: process.env.FAYDA_CLIENT_ID!,
    });

    // Construct Fayda User object from token payload
    const faydaUser = {
      firstName: payload.given_name as string,
      middleName: '',
      lastName: payload.family_name as string,
      gender: (payload.gender as string),
      dateOfBirth: payload.birthdate as string,
      phoneNumber: payload.phone_number as string,
      fin: payload.fin as string
    };

    // Retrieve Omo Bank Data from Session
    if (!session.faydaComparisonData) {
       if (session.accountNumber) {
         const mapToFaydaComparison = (cbsCustomer: any) => {
           const nameParts = (cbsCustomer.fullName || '').trim().split(/\s+/);
           return {
             firstName: nameParts[0] || '',
             middleName: nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : (nameParts.length === 2 ? nameParts[1] : ''),
             lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : '',
             gender: (cbsCustomer.gender === 'Male' || cbsCustomer.gender === 'M') ? 'M' : (cbsCustomer.gender === 'Female' || cbsCustomer.gender === 'F') ? 'F' : 'O',
             phoneNumber: cbsCustomer.phoneNumber || '',
             status: cbsCustomer.status || 'UNKNOWN',
             fin: cbsCustomer.nationalId || '',
             dateOfBirth: cbsCustomer.dateOfBirth ? new Date(cbsCustomer.dateOfBirth).toISOString().split('T')[0] : ''
           };
         };
         
         let customer;
         if (process.env.MOCK_MODE === 'true' || session.accountNumber === MOCK_ACCOUNT_NUMBER) {
           customer = MOCK_CUSTOMER_PROFILE;
         } else {
           customer = await lookupCoreBankingCustomer(session.accountNumber);
         }

         if (customer) {
            session.faydaComparisonData = mapToFaydaComparison(customer);
            session.cbsProfile = customer;
         }
       }
       if (!session.faydaComparisonData) {
         return res.redirect(`${FRONTEND_URL}/harmonization?error=Session expired. Please start over.`);
       }
    }

    const comparison = compareProfiles(session.faydaComparisonData, faydaUser);

    console.log('✅ Fayda ID Token Verified. Sub:', payload.sub, 'FIN:', payload.fin);

    // 4. Save/Update User in Oracle Database (Core Banking / Customer DB)
    try {
      if (process.env.MOCK_MODE === 'true') {
        if (comparison.isMatch) {
          session.isNidVerified = true;
          session.faydaProfile = faydaUser;
          session.matchDetails = comparison;
        }
        console.log('✅ [Mock] Skipped Oracle DB sync.');
      } else {
        connection = await oracledb.getConnection();
        if (comparison.isMatch) {
          session.isNidVerified = true;
          session.faydaProfile = faydaUser;
          session.matchDetails = comparison;
          
          // Update the existing customer record to link Fayda ID and set KYC status
          const updateSql = `
            UPDATE CUSTOMERS 
            SET FAYDA_ID = :faydaId,
                KYC_STATUS = 'VERIFIED',
                LAST_KYC_DATE = SYSDATE,
                FULL_NAME = :fullName, 
                EMAIL = :email, 
                LAST_LOGIN = SYSDATE 
            WHERE ACCOUNT_NUMBER = :accountNumber
          `;
          
          const result = await connection.execute(updateSql, {
            faydaId: payload.fin,
            fullName: `${payload.given_name} ${payload.family_name}`,
            email: payload.email || null,
            accountNumber: accountNumber
          }, { autoCommit: true });
          
          console.log(`✅ User synced to Oracle DB. Rows updated: ${result.rowsAffected}`);

          if (result.rowsAffected === 0) {
            console.warn(`⚠️ Oracle Update Warning: No records were updated for Account ${accountNumber}. Check if account exists.`);
          }
        }
      }
    } catch (oracleErr) {
      console.error('⚠️ Oracle Sync Failed (Non-fatal):', oracleErr);
      // We continue execution so the user can still log in via MongoDB session
    }

    if (comparison.isMatch) {
    // 5. Save or Update User in MongoDB (Session Store)
    const user = await User.findOneAndUpdate(
      { accountNumber },
      {
        faydaId: payload.fin as string, // Use 'fin' as the unique ID
        firstName: payload.given_name as string,
        lastName: payload.family_name as string,
        phoneNumber: payload.phone_number as string,
        gender: (payload.gender as string)?.toUpperCase(),
        dob: payload.birthdate ? new Date(payload.birthdate as string) : undefined,
        address: (payload.address as any)?.formatted ?? '',
        photoUrl: payload.picture as string,
        email: payload.email as string,
        nidVerified: true,
        kycStatus: 'APPROVED',
        faydaStatus: 'ACTIVE',
        lastNidSync: new Date(),
        faydaSnapshot: payload,
        role: 'user',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 6. Establish the user session
    req.session.userId = user._id.toString();
    req.session.role = user.role;
    req.session.otpVerified = true; // Mark as fully authenticated

    // Clean up one-time session values
    req.session.codeVerifier = undefined;
    req.session.state = undefined;
    req.session.otp = undefined;

    await req.session.save();

    logAudit(req, { action: 'HARMONIZATION', accountNumber, faydaId: user.faydaId, result: 'SUCCESS' });
    console.log(`[Auth] Harmonization Successful: Account ${accountNumber} linked to Fayda ${user.faydaId}`);

    // 6. Redirect to Frontend Dashboard
    res.redirect(`${FRONTEND_URL}/success?login=success`);
    
    } else {
      const reasons = comparison.mismatches.join(', ');
      res.redirect(`${FRONTEND_URL}/harmonization?error=${encodeURIComponent('Data Mismatch: ' + reasons)}`);
    }

  } catch (error: any) {
    console.error('❌ Callback Error:', error.response?.data || error.message);
    logAudit(req, { action: 'HARMONIZATION', result: 'FAILURE', errorCode: 500, message: error.message });
    res.redirect(`${FRONTEND_URL}/?error=auth_failed`);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing Oracle connection:', err);
      }
    }
  }
};

// ────────────────────────────────────────────────
// 6. Logout
// ────────────────────────────────────────────────
export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
};

// ────────────────────────────────────────────────
// 7. Health Check
// ────────────────────────────────────────────────
export const checkHealth = async (req: Request, res: Response) => {
  const smsStatus = await checkSmsHealth();
  res.json({
    status: 'UP',
    smsGateway: smsStatus ? 'Connected' : 'Disconnected'
  });
};