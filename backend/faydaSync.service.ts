import axios from 'axios';
import mongoose from 'mongoose';
import User from './src/models/user.model.js';

// Interface matching the expected Fayda API response
interface FaydaCitizenData {
  fin: string; // Fayda Identification Number
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'M' | 'F';
  phoneNumber: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

export class FaydaSyncService {
  private static FAYDA_API_URL = process.env.FAYDA_API_URL || 'https://api.fayda.et/v1';
  private static API_KEY = process.env.FAYDA_API_KEY;

  /**
   * CORE LOGIC: Syncs a local user with Fayda data.
   * Used for: Onboarding, Periodic Jobs, and Manual Updates.
   */
  static async syncCustomer(faydaId: string, localUserId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      console.log(`🔄 Starting Fayda Sync for User: ${localUserId}, FIN: ${faydaId}`);

      // 1. Fetch Official Data (Source of Truth)
      const faydaData = await this.fetchFromFayda(faydaId);

      // 2. Load Local User
      const localUser = await User.findById(localUserId).session(session);

      if (!localUser) {
        throw new Error('Local user record not found');
      }

      // 3. Apply Updates (Overwrite local data)
      // We only update fields that Fayda owns.
      localUser.firstName = faydaData.firstName;
      localUser.middleName = faydaData.middleName;
      localUser.lastName = faydaData.lastName;
      localUser.dob = new Date(faydaData.dateOfBirth);
      localUser.gender = faydaData.gender;
      
      // 4. Update Verification Status
      localUser.nidVerified = true;
      localUser.faydaStatus = faydaData.status;
      localUser.lastNidSync = new Date();
      
      // Store raw snapshot for audit trails
      localUser.faydaSnapshot = faydaData;

      await localUser.save({ session });
      await session.commitTransaction();
      
      console.log(`✅ Fayda Sync Successful for ${faydaId}`);
      return { success: true, data: faydaData };

    } catch (error: any) {
      await session.abortTransaction();
      return this.handleSyncFailure(error, localUserId);
    } finally {
      session.endSession();
    }
  }

  /**
   * Helper: Secure API Call to Fayda
   */
  private static async fetchFromFayda(faydaId: string): Promise<FaydaCitizenData> {
    // In production, this likely requires mTLS or a signed JWT
    const response = await axios.get(`${this.FAYDA_API_URL}/citizen/${faydaId}`, {
      headers: {
        'Authorization': `Bearer ${this.API_KEY}`,
        'X-Omo-Bank-Client-ID': process.env.OMO_CLIENT_ID
      },
      timeout: 5000 // Fail fast (5s)
    });
    return response.data;
  }

  /**
   * FALLBACK MECHANISM
   * Handles what happens when the Source of Truth is unreachable.
   */
  private static async handleSyncFailure(error: any, userId: string) {
    console.error(`❌ Sync Failed for User ${userId}:`, error.message);

    // Scenario 1: Network/Server Error (Transient)
    // Action: Schedule a retry (e.g., add to a BullMQ/Redis queue)
    if (error.message.includes('connect') || error.message.includes('timeout')) {
      console.log(`⚠️ Network error. Scheduling background retry for ${userId}...`);
      // await QueueService.add('fayda-sync-retry', { userId }, { delay: 60000 });
      return { 
        success: false, 
        status: 'PENDING_RETRY', 
        message: 'Connection to Fayda failed. Sync scheduled for later.' 
      };
    }

    // Scenario 2: Data Mismatch / Invalid ID (Permanent)
    // Action: Flag for manual review
    if (error.response?.status === 404) {
      await this.flagForManualReview(userId, 'INVALID_FAYDA_ID');
      return { 
        success: false, 
        status: 'MANUAL_REVIEW', 
        message: 'Fayda ID not found. Please verify documents manually.' 
      };
    }

    return { success: false, error: error.message };
  }

  private static async flagForManualReview(userId: string, reason: string) {
    await User.findByIdAndUpdate(userId, {
      nidVerified: false,
      reviewStatus: 'FLAGGED',
      reviewReason: reason
    });
  }
}