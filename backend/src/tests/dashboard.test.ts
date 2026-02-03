import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import dashboardRoutes from '../routes/dashboard.routes.js';
import User from '../models/user.model.js';
import Harmonization from '../models/Harmonization.js';

// 1. Mock Authentication Middleware
jest.mock('../middleware/auth.middleware.js', () => ({
  authenticate: (req: any, res: any, next: any) => {
    // Allow tests to control role via header, default to admin
    const role = req.headers['x-test-role'] || 'admin';
    req.user = { userId: 'admin-id', role };
    next();
  },
  requireAdmin: (req: any, res: any, next: any) => {
    if (req.user?.role === 'admin') return next();
    res.status(403).json({ message: 'Forbidden' });
  }
}));

// 2. Mock Models with Factory Functions (Required for ESM default exports)
jest.mock('../models/user.model.js', () => ({
  __esModule: true,
  default: {
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  },
}));

jest.mock('../models/Harmonization.js', () => ({
  __esModule: true,
  default: {
    countDocuments: jest.fn(),
  },
}));

// 3. Setup Express App
const app = express();
app.use(express.json());
app.use('/api/dashboard', dashboardRoutes);

describe('Dashboard API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /stats', () => {
    it('should return aggregated system statistics', async () => {
      // Arrange: Mock DB responses
      (User.countDocuments as jest.Mock).mockResolvedValue(150);
      (Harmonization.countDocuments as jest.Mock).mockResolvedValue(45);

      // Act
      const res = await request(app).get('/api/dashboard/stats');

      // Assert
      expect(res.status).toBe(200);
      // Adjust these expectations to match your actual API response structure
      expect(res.body).toEqual(expect.objectContaining({
        totalUsers: 150,
        harmonizedUsers: 45
      }));
    });
  });

  describe('GET /stats with date filters', () => {
    it('should apply date range filters to database queries', async () => {
      // Arrange
      (User.countDocuments as jest.Mock).mockResolvedValue(10);
      (Harmonization.countDocuments as jest.Mock).mockResolvedValue(5);

      // Act
      const res = await request(app).get('/api/dashboard/stats?startDate=2024-01-01&endDate=2024-12-31');

      // Assert
      expect(res.status).toBe(200);
      
      // Verify that countDocuments was called with createdAt filter
      expect(User.countDocuments).toHaveBeenCalledWith(expect.objectContaining({
        createdAt: expect.anything()
      }));
    });
  });

  describe('GET /chart-data', () => {
    it('should return daily registration counts', async () => {
      // Arrange
      const mockAggregationResult = [
        { _id: '2024-01-01', count: 5 },
        { _id: '2024-01-02', count: 8 }
      ];
      (User.aggregate as jest.Mock).mockResolvedValue(mockAggregationResult);

      // Act
      const res = await request(app).get('/api/dashboard/chart-data?days=7');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([
        { date: '2024-01-01', count: 5 },
        { date: '2024-01-02', count: 8 }
      ]);
    });
  });

  describe('Access Control', () => {
    it('should deny access to non-admin users', async () => {
      const res = await request(app)
        .get('/api/dashboard/stats')
        .set('x-test-role', 'user'); // Simulate non-admin

      expect(res.status).toBe(403);
    });
  });
});