import { Request, Response } from 'express';
import { sendSms } from '../services/sms.service.js';

export const sendOtp = async (req: Request, res: Response): Promise<any> => {
  try {
    const { accountNumber } = req.body;

    if (!accountNumber) {
      return res.status(400).json({ message: 'Account number is required' });
    }

    console.log(`[OTP-SEND] Request for Account: ${accountNumber}. SessionID: ${req.sessionID}`);

    // 1. Mock Phone Number Lookup (In real app, query Core Banking System by Account Number)
    // For testing: In dev mode, allow passing phoneNumber in body to test SMS delivery
    let phoneNumber = '0911234567'; 
    if (process.env.NODE_ENV === 'development' && req.body.phoneNumber) {
      phoneNumber = req.body.phoneNumber;
    }

    // 2. Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Send SMS First (Fail fast if SMS fails)
    await sendSms(phoneNumber, `Your Omo Bank Verification Code is: ${otp}`);

    // 3. Store in Session (for verification step)
    if (req.session) {
      (req.session as any).otp = otp;
      (req.session as any).otpExpires = Date.now() + 5 * 60 * 1000; // 5 mins
      (req.session as any).accountNumber = accountNumber;
      (req.session as any).otpVerified = false; // Reset verification status
      
      console.log(`[OTP-SEND] Saving OTP to session: ${otp}`);

      // Explicitly save session and await completion
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('OTP Error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<any> => {
  try {
    const { otp, accountNumber } = req.body;
    const session = req.session as any;

    console.log(`[OTP-VERIFY] Request for Account: ${accountNumber}, OTP: ${otp}. SessionID: ${req.sessionID}`);
    console.log(`[OTP-VERIFY] Session Data:`, { 
        otp: session?.otp, 
        expires: session?.otpExpires, 
        account: session?.accountNumber 
    });

    if (!session || !session.otp) {
      console.error('Verify OTP failed: Session or OTP missing', { sessionID: req.sessionID });
      return res.status(400).json({ message: 'OTP expired or not requested.' });
    }

    if (Date.now() > session.otpExpires) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (session.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP code.' });
    }

    // Mark session as verified
    session.otpVerified = true;
    session.otp = null; // Clear OTP to prevent reuse
    await session.save();

    res.json({ success: true, message: 'Verification successful' });
  } catch (error) {
    console.error('OTP Verify Error:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
};