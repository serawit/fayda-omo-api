import { Request, Response } from 'express';
import User from '../models/user.model.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { z } from 'zod';
import { FaydaSyncService } from '../services/faydaSync.service.js';

const updateProfileSchema = z.object({
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
});

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await User.findById(userId).select('-__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const refreshNidData = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user || !user.faydaId) {
      return res.status(400).json({ message: 'User not found or no Fayda ID linked.' });
    }

    const result = await FaydaSyncService.syncCustomer(user.faydaId, user.id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({ success: true, message: 'Identity synced successfully', data: result.data });
  } catch (error) {
    res.status(500).json({ message: 'Sync failed', error: (error as Error).message });
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { email, address } = updateProfileSchema.parse(req.body);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields (fullName and phoneNumber are usually restricted/read-only in this context)
    if (email !== undefined) user.email = email; 
    if (address !== undefined) user.address = address;
    
    await user.save();

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
