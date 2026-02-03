import jwt from 'jsonwebtoken';
export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const secret = process.env.JWT_SECRET || 'fallback-secret-key-change-in-prod';
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
};
export const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    next();
};
export const requireOtpVerified = (req, res, next) => {
    if (req.session?.otpVerified) {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: 'Forbidden: OTP verification is required to access this resource.',
    });
};
//# sourceMappingURL=auth.middleware.js.map