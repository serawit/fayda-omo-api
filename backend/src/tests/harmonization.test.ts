import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import harmonizationRoutes from '../routes/harmonization.routes.js';
import Harmonization from '../models/Harmonization.js';

// 1. Mock the Authentication Middleware
// This bypasses the actual JWT check and injects a mock user into the request
jest.mock('../middleware/auth.middleware.js', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { userId: 'test-user-id', accountNumber: '1234567890123456' };
    next();
  }
}));

// 2. Mock the Mongoose Model
jest.mock('../models/Harmonization.js', () => ({
  __esModule: true,
  default: {
    findOneAndUpdate: jest.fn(),
  },
}));

// 3. Setup a minimal Express app for testing
const app = express();
app.use(express.json());
app.use('/api/harmonization', harmonizationRoutes);

describe('Harmonization API Routes', () => {
  // Clear mocks before each test to ensure clean state
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /validate-fan', () => {
    it('should return 400 if FAN is not 16 digits', async () => {
      const res = await request(app)
        .post('/api/harmonization/validate-fan')
        .send({ fan: '12345' }); // Invalid length

      expect(res.status).toBe(400);
      // Check that the response contains the error message anywhere in the body (handles { message } or { errors: [] })
      expect(JSON.stringify(res.body)).toMatch(/16 digits/);
    });

    it('should return 200 and save record for valid FAN', async () => {
      // Mock the DB response
      (Harmonization.findOneAndUpdate as jest.Mock).mockResolvedValue({
        fan: '1234567890123456',
        status: 'PENDING'
      });

      const res = await request(app)
        .post('/api/harmonization/validate-fan')
        .send({ fan: '1234567890123456' });

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
      
      // Verify DB was called with correct parameters
      expect(Harmonization.findOneAndUpdate).toHaveBeenCalledWith(
        { fan: '1234567890123456' },
        expect.objectContaining({ 
          fan: '1234567890123456',
          accountNumber: '1234567890123456', // From mocked auth middleware
          status: 'PENDING'
        }),
        { upsert: true, new: true }
      );
    });

    it('should return 404 for the specific mock rejected FAN', async () => {
      // Ensure mock returns null (not found)
      (Harmonization.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/harmonization/validate-fan')
        .send({ fan: '1111222233334444' }); // Use a valid-looking FAN that is not found

      expect(res.status).toBe(404);
    });
  });

  describe('POST /verify-otp', () => {
    it('should verify OTP and update status to VERIFIED', async () => {
      (Harmonization.findOneAndUpdate as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .post('/api/harmonization/verify-otp')
        .send({ fan: '1234567890123456' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});