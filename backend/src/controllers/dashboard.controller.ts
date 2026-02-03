import { Request, Response } from 'express';
import User from '../models/user.model.js';
import Harmonization from '../models/Harmonization.js';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const filter: any = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    // Run queries in parallel for performance
    const [totalUsers, verifiedUsers, harmonizedAccounts, pendingHarmonization] = await Promise.all([
      User.countDocuments(filter),
      User.countDocuments({ ...filter, nidVerified: true }),
      Harmonization.countDocuments({ ...filter, status: 'VERIFIED' }),
      Harmonization.countDocuments({ ...filter, status: 'PENDING' })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        verifiedUsers,
        harmonizedAccounts,
        pendingHarmonization,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: (error as Error).message });
  }
};

export const getRegistrationChartData = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - Number(days));

    const chartData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: dateLimit }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: chartData.map(item => ({ date: item._id, count: item.count }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chart data', error: (error as Error).message });
  }
};