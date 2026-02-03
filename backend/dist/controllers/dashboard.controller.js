import HarmonizationLog from '../models/HarmonizationLog.js';
export const getDashboardData = async (req, res) => {
    try {
        const { range = 'week', limit = '50' } = req.query;
        const limitNum = Math.min(Math.max(10, parseInt(limit, 10)), 200);
        let startDate;
        const now = new Date();
        if (range === 'today') {
            startDate = new Date(now.setHours(0, 0, 0, 0));
        }
        else if (range === 'week') {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
        }
        else if (range === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        const matchStage = startDate ? { createdAt: { $gte: startDate } } : {};
        const statsPipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
                    success: { $sum: { $cond: [{ $eq: ['$status', 'Successful'] }, 1, 0] } },
                },
            },
            {
                $project: {
                    total: 1,
                    pending: 1,
                    successRate: {
                        $cond: [
                            { $eq: ['$total', 0] },
                            '0%',
                            { $concat: [{ $toString: { $multiply: [{ $divide: ['$success', '$total'] }, 100] } }, '%'] },
                        ],
                    },
                },
            },
        ];
        const statsResult = await HarmonizationLog.aggregate(statsPipeline);
        const stats = statsResult[0] || {
            total: 0,
            pending: 0,
            successRate: '0%',
        };
        stats.total = stats.total.toLocaleString();
        const recentLogs = await HarmonizationLog.find(matchStage)
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .select('user fullName status createdAt')
            .lean();
        const logsByDay = {
            Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [],
        };
        recentLogs.forEach((log) => {
            const date = new Date(log.createdAt);
            const dayName = date.toLocaleString('en-US', { weekday: 'short' });
            const timestamp = date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
            logsByDay[dayName].push({
                id: log._id.toString(),
                user: log.fullName || log.user || 'Unknown',
                status: log.status,
                timestamp,
            });
        });
        return res.status(200).json({
            success: true,
            stats,
            logs: logsByDay,
            meta: {
                range,
                returned: recentLogs.length,
                limit: limitNum,
            },
        });
    }
    catch (error) {
        console.error('getDashboardData failed:', {
            message: error.message,
            stack: error.stack,
        });
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
//# sourceMappingURL=dashboard.controller.js.map