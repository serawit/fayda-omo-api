import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    otpVerified?: boolean;
    otpLockedUntil?: number;
  }
}

export interface UserPayload {
  userId: string;
  role: string;
}

// Extend Express Request interface to include user info
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // 1. Check Session (Cookie) - Priority for Browser/Frontend
  if (req.session && (req.session as any).userId) {
    req.user = {
      userId: (req.session as any).userId,
      role: (req.session as any).role || 'user'
    };
    return next();
  }

  // 2. Check JWT (Bearer Token) - Priority for API/Mobile
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key-change-in-prod';
    const decoded = jwt.verify(token, secret) as UserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Forbidden: Invalid token' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  next();
};

/**
 * Middleware to ensure a user has completed the OTP verification step.
 * It checks for a flag in the user's session.
 */
export const requireOtpVerified = (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.otpVerified) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Forbidden: OTP verification is required to access this resource.',
  });
};