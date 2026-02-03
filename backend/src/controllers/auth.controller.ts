// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import axios from 'axios';
import * as jose from 'jose';
import crypto from 'crypto';
import { z } from 'zod';
import User from '../models/user.model.js';
import { sendSms } from '../services/sms.service.js';
import { generateCodeVerifier, generateCodeChallenge } from '../utils/pkce.js';
import { lookupCoreBankingCustomer } from '../services/coreBanking.service.js';
import { logAudit } from '../utils/auditLogger.js';

// ────────────────────────────────────────────────
// Config (from .env)
// ────────────────────────────────────────────────

const FAYDA_AUTH_URL = process.env.FAYDA_BASE_URL || 'https://auth.fayda.et';

const REDIRECT_URI =
  process.env.REDIRECT_URI || 'https://fayda.omobanksc.com/auth/fayda/callback';

const FRONTEND_URL =
  process.env.FRONTEND_URL || 'http://10.11.0.59:3000';

// ────────────────────────────────────────────────
// Schemas
// ────────────────────────────────────────────────

const initiateSchema = z.object({
  accountNumber: z.string()
    .min(8, 'Account number must be at least 8 digits')
    .max(30, 'Account number must be at most 30 digits')
    .regex(/^\d+$/, 'Account number must contain only digits')
    .trim(),
});

const otpVerifySchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  accountNumber: z.string()
    .min(8, 'Account number must be at least 8 digits')
    .max(30, 'Account number must be at most 30 digits')
    .regex(/^\d+$/, 'Account number must contain only digits')
    .trim(),
});

const fanSchema = z.string().regex(/^\d{16}$/, 'Fayda ID must be exactly 16 digits');

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
    const coreCustomer = await lookupCoreBankingCustomer(accountNumber);

    if (!coreCustomer) {
      logAudit(req, { action: 'LOGIN_INITIATE', accountNumber, result: 'FAILURE', errorCode: 404, message: 'Account Not Found' });
      return res.status(404).json({ success: false, message: 'Account not found in Omo Bank records.' });
    }

    if (coreCustomer.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'Account is not active.' });
    }

    const phoneNumber = coreCustomer.phoneNumber;

    const otp = generateOtp();

    // Format SMS for WebOTP API (origin-bound one-time codes)
    // The last line must be in the format: @<domain> #<otp>
    const origin = new URL(FRONTEND_URL).hostname;
    const message = `Your Fayda Verification code: ${otp}. Welcome to Omo Bank Harmonization.\n\n@${origin} #${otp}`;

    console.log(`[Auth] Sending OTP to ${accountNumber} (Masked Phone: ${phoneNumber.replace(/.(?=.{4})/g, "*")})`);
    await sendSms(phoneNumber, message);

    req.session.accountNumber = accountNumber;
    req.session.otp = otp;
    req.session.otpCreatedAt = Date.now();
    req.session.otpAttempts = 0;
    req.session.otpVerified = false;

    await req.session.save();

    logAudit(req, { action: 'LOGIN_INITIATE', accountNumber, result: 'SUCCESS' });

    // 5. Send success back to Frontend (Mask the phone number for security)
    const maskedPhone = phoneNumber.replace(/.(?=.{4})/g, "*"); 

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
    const isAuthenticated = (req.session?.otpVerified && req.session?.accountNumber) || (req.session?.userId && req.session?.accountNumber);

    if (isAuthenticated && req.session?.accountNumber) {
      // 5. Display verified user data (Fetch from DB)
      let user = await User.findOne({ accountNumber: req.session.accountNumber });
      let cbsProfile = null;

      // If not yet linked locally, fetch from Core Banking to show confirmation details
      if (!user) {
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

    res.status(403).json({
      success: false,
      isAuthenticated: false,
      message: 'Session invalid or expired.',
    });
  } catch (err) {
    console.error('getSessionStatus error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ────────────────────────────────────────────────
// 4. Initiate Fayda consent (OIDC + PKCE)
// ────────────────────────────────────────────────

export const initiateConsent = async (req: Request, res: Response) => {
  try {
    if (!req.session.otpVerified || !req.session.accountNumber) {
      return res.status(403).json({ success: false, message: 'OTP verification required' });
    }

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
    authUrl.searchParams.set(
      'scope',
      'openid profile phone email address birthdate nationality gender picture'
    );
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    res.status(200).json({
      success: true,
      consentUrl: authUrl.toString(),
    });
  } catch (err) {
    console.error('initiateConsent error:', err);
    res.status(500).json({ success: false, message: 'Failed to start consent' });
  }
};

// ────────────────────────────────────────────────
// 5. Handle Fayda callback
// ────────────────────────────────────────────────

export const handleCallback = async (req: Request, res: Response) => {
  const { code, state, error } = req.query as { code?: string; state?: string; error?: string };

  if (error) {
    console.error('[Auth] Callback Error from Fayda:', error);
    return res.redirect(`${FRONTEND_URL}/error?reason=consent_denied`);
  }

  if (!state || state !== req.session?.state) {
    return res.redirect(`${FRONTEND_URL}/error?reason=invalid_state`);
  }

  if (!req.session.codeVerifier || !req.session.accountNumber) {
    return res.redirect(`${FRONTEND_URL}/error?reason=session_invalid`);
  }

  try {
    const tokenResponse = await axios.post(
      `${FAYDA_AUTH_URL}/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: REDIRECT_URI,
        client_id: process.env.FAYDA_CLIENT_ID!,
        client_secret: process.env.FAYDA_CLIENT_SECRET!,
        code_verifier: req.session.codeVerifier,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { id_token } = tokenResponse.data;

    const JWKS = jose.createRemoteJWKSet(new URL(`${FAYDA_AUTH_URL}/.well-known/jwks.json`));
    const { payload } = await jose.jwtVerify(id_token, JWKS, {
      issuer: FAYDA_AUTH_URL,
      audience: process.env.FAYDA_CLIENT_ID!,
    });

    const accountNumber = req.session.accountNumber;

    // Rule: Prevent re-harmonization if already verified
    const currentUser = await User.findOne({ accountNumber });
    if (currentUser?.nidVerified) {
      console.log(`[Auth] Account ${accountNumber} is already verified. Redirecting to success.`);
      // Ensure session is fully authenticated so Success/Dashboard works
      req.session.userId = currentUser._id.toString();
      req.session.role = currentUser.role;
      await req.session.save();
      
      return res.redirect(`${FRONTEND_URL}/success`);
    }

    // Rule 3: Maximum five accounts per Fayda ID
    const faydaId = payload.fin as string;
    const existingLinksCount = await User.countDocuments({ 
      faydaId: faydaId, 
      accountNumber: { $ne: accountNumber } // Don't count the current account if it's already linked
    });

    if (existingLinksCount >= 5) {
      console.warn(`[Auth] Business Rule Violation: Fayda ID ${faydaId} exceeded max accounts limit (5).`);
      logAudit(req, { action: 'HARMONIZATION', accountNumber, faydaId, result: 'FAILURE', errorCode: 'MAX_ACCOUNTS', message: 'Max accounts limit reached' });
      return res.redirect(`${FRONTEND_URL}/error?reason=max_accounts_limit`);
    }

    const user = await User.findOneAndUpdate(
      { accountNumber },
      {
        faydaId: payload.fin as string,
        firstName: payload.given_name as string,
        lastName: payload.family_name as string,
        phoneNumber: payload.phone_number as string,
        gender: (payload.gender as string)?.toUpperCase(),
        dob: payload.birthdate ? new Date(payload.birthdate as string) : undefined,
        address: (payload.address as any)?.formatted ?? '',
        photoUrl: payload.picture as string,
        email: payload.email as string,
        nidVerified: true,
        faydaStatus: 'ACTIVE',
        lastNidSync: new Date(),
        faydaSnapshot: payload,
        role: 'user',
        accountNumber: accountNumber
      },
      { upsert: true, new: true }
    );

    req.session.codeVerifier = undefined;
    req.session.state = undefined;
    req.session.otpVerified = undefined;
    
    // Log the user in via session
    req.session.userId = user._id.toString();
    req.session.role = user.role;

    await req.session.save();

    console.log(`[Auth] Harmonization Successful: Account ${accountNumber} linked to Fayda ${faydaId}`);
    logAudit(req, { action: 'HARMONIZATION', accountNumber, faydaId, result: 'SUCCESS' });
    res.redirect(`${FRONTEND_URL}/success`);
  } catch (err: any) {
    console.error('handleCallback error:', err.message, err.response?.data);
    logAudit(req, { action: 'HARMONIZATION', result: 'FAILURE', errorCode: 500, message: err.message });
    res.redirect(`${FRONTEND_URL}/error?reason=server_error`);
  }
};

// ────────────────────────────────────────────────
// 6. Handle Frontend Callback (POST)
// ────────────────────────────────────────────────

export const harmonizeAccount = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const accountNumber = req.session.accountNumber;

    if (!accountNumber) {
      return res.status(401).json({ message: 'Session expired. Please login again.' });
    }

    // 1. Check if already verified
    const existingUser = await User.findOne({ accountNumber });
    if (existingUser?.nidVerified) {
      // Log them in immediately so they can access Success/Dashboard
      req.session.userId = existingUser._id.toString();
      req.session.role = existingUser.role;
      await req.session.save();

      return res.status(200).json({ 
        success: true, 
        message: 'Account is already verified.',
        user: existingUser
      });
    }

    // 2. Exchange Authorization Code for Access Token
    const tokenResponse = await axios.post(
      `${FAYDA_AUTH_URL}/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI, // Ensure this matches what was sent in initiateConsent
        client_id: process.env.FAYDA_CLIENT_ID!,
        client_secret: process.env.FAYDA_CLIENT_SECRET!,
        code_verifier: req.session.codeVerifier || '',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { id_token } = tokenResponse.data;

    // 3. Verify ID Token
    const JWKS = jose.createRemoteJWKSet(new URL(`${FAYDA_AUTH_URL}/.well-known/jwks.json`));
    const { payload } = await jose.jwtVerify(id_token, JWKS, {
      issuer: FAYDA_AUTH_URL,
      audience: process.env.FAYDA_CLIENT_ID!,
    });

    // 4. Update User
    const user = await User.findOneAndUpdate(
      { accountNumber },
      {
        faydaId: payload.fin as string,
        firstName: payload.given_name as string,
        lastName: payload.family_name as string,
        phoneNumber: payload.phone_number as string,
        gender: (payload.gender as string)?.toUpperCase(),
        dob: payload.birthdate ? new Date(payload.birthdate as string) : undefined,
        address: (payload.address as any)?.formatted ?? '',
        photoUrl: payload.picture as string,
        email: payload.email as string,
        nidVerified: true,
        faydaStatus: 'ACTIVE',
        lastNidSync: new Date(),
        faydaSnapshot: payload,
        role: 'user',
        accountNumber: accountNumber
      },
      { upsert: true, new: true }
    );

    // Clear session sensitive data
    req.session.codeVerifier = undefined;
    req.session.state = undefined;
    await req.session.save();

    logAudit(req, { action: 'HARMONIZATION', accountNumber, result: 'SUCCESS' });
    res.json({ success: true, message: 'Identity successfully harmonized', user });

  } catch (error: any) {
    console.error('Harmonization Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to synchronize with National ID system.' });
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