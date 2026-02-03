import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import axios from 'axios';
import mongoose from 'mongoose';
import User from './src/models/user.model.js';
import { FaydaSyncService } from './src/services/faydaSync.service.js';

// Mock dependencies
jest.mock('axios');
jest.mock('mongoose', () => {
  return {
  __esModule: true,
  default: {
    startSession: jest.fn(),
    model: jest.fn(),
    Schema: class {},
  },
  };
});
jest.mock('./src/models/user.model.js');

describe('FaydaSyncService', () => {
  const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  };

  const mockUser = {
    _id: 'user123',
    firstName: 'OldName',
    save: jest.fn(),
  };

  const mockFaydaData = {
    fin: 'FIN123',
    firstName: 'Abebe',
    middleName: 'Kebede',
    lastName: 'Tessema',
    dateOfBirth: '1990-01-01',
    gender: 'M',
    phoneNumber: '0911000000',
    status: 'ACTIVE',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Mongoose Session
    (mongoose.startSession as jest.Mock).mockResolvedValue(mockSession);
    // Mock User.findById default behavior
    (User.findById as jest.Mock).mockReturnValue({
      session: jest.fn().mockResolvedValue(mockUser),
    });
    // Mock User.findByIdAndUpdate
    (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);
  });

  it('should sync successfully when Fayda returns valid data', async () => {
    // Arrange
    (axios.get as jest.Mock).mockResolvedValue({ data: mockFaydaData });

    // Act
    const result = await FaydaSyncService.syncCustomer('FIN123', 'user123');

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockFaydaData);
    
    // Verify User Update
    expect(mockUser.firstName).toBe('Abebe'); // Should be updated
    expect(mockUser.save).toHaveBeenCalledWith({ session: mockSession });
    
    // Verify Transaction
    expect(mockSession.commitTransaction).toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalled();
  });

  it('should handle Network Errors by returning PENDING_RETRY', async () => {
    // Arrange
    const networkError = new Error('connect ETIMEDOUT');
    (axios.get as jest.Mock).mockRejectedValue(networkError);

    // Act
    const result = await FaydaSyncService.syncCustomer('FIN123', 'user123');

    // Assert
    expect(result.success).toBe(false);
    expect((result as any).status).toBe('PENDING_RETRY');
    
    // Verify Transaction Abort
    expect(mockSession.abortTransaction).toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalled();
  });

  it('should handle Invalid ID (404) by flagging for MANUAL_REVIEW', async () => {
    // Arrange
    const notFoundError = {
      message: 'Request failed with status code 404',
      response: { status: 404 }
    };
    (axios.get as jest.Mock).mockRejectedValue(notFoundError);

    // Act
    const result = await FaydaSyncService.syncCustomer('INVALID_FIN', 'user123');

    // Assert
    expect(result.success).toBe(false);
    expect((result as any).status).toBe('MANUAL_REVIEW');

    // Verify DB Flagging
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user123', expect.objectContaining({
      nidVerified: false,
      reviewStatus: 'FLAGGED',
      reviewReason: 'INVALID_FAYDA_ID'
    }));

    expect(mockSession.abortTransaction).toHaveBeenCalled();
  });

  it('should fail if local user is not found', async () => {
    // Arrange
    (axios.get as jest.Mock).mockResolvedValue({ data: mockFaydaData });
    
    // Mock User.findById to return null
    (User.findById as jest.Mock).mockReturnValue({
      session: jest.fn().mockResolvedValue(null as any),
    } as any);

    // Act
    const result = await FaydaSyncService.syncCustomer('FIN123', 'missing_user');

    // Assert
    expect(result.success).toBe(false);
    expect((result as any).error).toContain('Local user record not found');
    expect(mockSession.abortTransaction).toHaveBeenCalled();
  });

  it('should sync successfully for specific sample ID 1234567890123456', async () => {
    // Arrange
    const specificId = '1234567890123456';
    const specificMockData = { ...mockFaydaData, fin: specificId };
    (axios.get as jest.Mock).mockResolvedValue({ data: specificMockData });

    // Act
    const result = await FaydaSyncService.syncCustomer(specificId, 'user123');

    // Assert
    expect(result.success).toBe(true);
    expect((result as any).data.fin).toBe(specificId);
  });
});
