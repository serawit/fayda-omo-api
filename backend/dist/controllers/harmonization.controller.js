import { z } from 'zod';
import Harmonization from '../models/Harmonization.js';
const fanSchema = z.string().regex(/^\d{16}$/, 'Fayda ID must be exactly 16 digits');
const otpVerifySchema = z.object({
    fan: fanSchema,
    otp: z.string().length(6, 'OTP must be 6 digits'),
});
const faceVerifySchema = z.object({
    fan: fanSchema,
    faceImage: z.string().min(100, 'Invalid face image'),
    accounts: z.array(z.string()).optional(),
});
const linkAccountsSchema = z.object({
    fan: fanSchema,
    accounts: z.array(z.string()).min(1, 'At least one account required'),
});
export const validateFan = async (req, res) => {
    try {
        const { fan } = fanSchema.parse(req.body.fan ? req.body : req.body);
        const isValid = fan.length === 16 && /^\d+$/.test(fan);
        if (!isValid) {
            return res.status(400).json({ success: false, message: 'Invalid Fayda ID' });
        }
        if (req.session) {
            req.session.faydaNumber = fan;
            await req.session.save();
        }
        res.status(200).json({
            success: true,
            valid: true,
            message: 'Fayda ID validated',
        });
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ success: false, errors: err.issues });
        }
        console.error('validateFan error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
export const sendOtp = async (req, res) => {
    try {
        const { fan } = fanSchema.parse(req.body);
        const phoneNumber = '+251911234567';
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        if (req.session) {
            req.session.otp = otp;
            req.session.otpCreatedAt = Date.now();
            await req.session.save();
        }
        console.log(`[OTP] FAN: ${fan} | Phone: ${phoneNumber} | OTP: ${otp}`);
        const masked = phoneNumber.replace(/\d(?=\d{4})/g, '*');
        res.status(200).json({
            success: true,
            message: 'OTP sent',
            maskedPhone: masked,
        });
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ success: false, errors: err.issues });
        }
        console.error('sendOtp error:', err);
        res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
};
export const verifyOtp = async (req, res) => {
    try {
        const { fan, otp } = otpVerifySchema.parse(req.body);
        if (!req.session?.otp || !req.session?.otpCreatedAt) {
            return res.status(400).json({ success: false, message: 'No OTP request found' });
        }
        if (Date.now() - req.session.otpCreatedAt > 10 * 60 * 1000) {
            return res.status(410).json({ success: false, message: 'OTP expired' });
        }
        if (req.session.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
        req.session.otp = undefined;
        req.session.otpCreatedAt = undefined;
        await Harmonization.findOneAndUpdate({ fan }, { fan, method: 'OTP', status: 'VERIFIED', verifiedAt: new Date() }, { upsert: true });
        await req.session.save();
        res.status(200).json({ success: true, message: 'OTP verified' });
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ success: false, errors: err.issues });
        }
        console.error('verifyOtp error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
export const verifyFace = async (req, res) => {
    try {
        const { fan, faceImage, accounts } = faceVerifySchema.parse(req.body);
        const matchScore = 0.92;
        if (matchScore < 0.85) {
            return res.status(400).json({
                success: false,
                message: 'Face verification failed – low match score',
                matchScore,
            });
        }
        await Harmonization.findOneAndUpdate({ fan }, {
            fan,
            method: 'FACE',
            status: 'VERIFIED',
            verifiedAt: new Date(),
            accounts: accounts || [],
            matchScore,
        }, { upsert: true });
        res.status(200).json({
            success: true,
            message: 'Face verified',
            matchScore,
        });
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ success: false, errors: err.issues });
        }
        console.error('verifyFace error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
export const linkAccounts = async (req, res) => {
    try {
        const { fan, accounts } = linkAccountsSchema.parse(req.body);
        if (!req.session?.accountNumber) {
            return res.status(403).json({ success: false, message: 'Session invalid' });
        }
        const accountNumber = req.session.accountNumber;
        await Harmonization.findOneAndUpdate({ fan }, {
            status: 'COMPLETED',
            accounts,
            harmonizedAt: new Date(),
        }, { upsert: true });
        res.status(200).json({
            success: true,
            message: 'Accounts linked successfully',
        });
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ success: false, errors: err.issues });
        }
        console.error('linkAccounts error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
//# sourceMappingURL=harmonization.controller.js.map