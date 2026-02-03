// src/services/faydaCustomer.service.ts
import FaydaCustomer, { IFaydaCustomer } from '../models/FaydaCustomer';
import { Types } from 'mongoose';

export class FaydaCustomerService {
  /**
   * Create or update customer after successful Fayda harmonization
   */
  static async harmonizeCustomer(
    data: Partial<IFaydaCustomer> & { accountNumber: string; faydaNumber: string }
  ): Promise<IFaydaCustomer> {
    const { accountNumber, faydaNumber, ...rest } = data;

    return FaydaCustomer.findOneAndUpdate(
      { accountNumber },
      {
        $set: {
          ...rest,
          faydaNumber,
          isHarmonized: true,
          harmonizedAt: new Date(),
          status: 'active',
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    ).lean();
  }

  /**
   * Find customer by Omo Bank account number
   */
  static async findByAccountNumber(accountNumber: string): Promise<IFaydaCustomer | null> {
    return FaydaCustomer.findOne({ accountNumber }).lean();
  }

  /**
   * Find customer by Fayda number (FAN)
   */
  static async findByFaydaNumber(faydaNumber: string): Promise<IFaydaCustomer | null> {
    return FaydaCustomer.findOne({ faydaNumber }).lean();
  }

  /**
   * Check if account is already harmonized
   */
  static async isHarmonized(accountNumber: string): Promise<boolean> {
    const customer = await FaydaCustomer.findOne({ accountNumber }, { isHarmonized: 1 }).lean();
    return !!customer?.isHarmonized;
  }

  /**
   * Get all harmonized customers (paginated)
   */
  static async getHarmonizedCustomers(
    page = 1,
    limit = 20
  ): Promise<{ customers: IFaydaCustomer[]; total: number }> {
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      FaydaCustomer.find({ isHarmonized: true })
        .skip(skip)
        .limit(limit)
        .sort({ harmonizedAt: -1 })
        .lean(),
      FaydaCustomer.countDocuments({ isHarmonized: true }),
    ]);

    return { customers, total };
  }

  /**
   * Update status (e.g., deactivate)
   */
  static async updateStatus(
    accountNumber: string,
    status: 'active' | 'inactive' | 'pending' | 'rejected'
  ): Promise<IFaydaCustomer | null> {
    return FaydaCustomer.findOneAndUpdate(
      { accountNumber },
      { $set: { status } },
      { new: true }
    ).lean();
  }
}

export default FaydaCustomerService;