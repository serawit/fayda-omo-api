import User from '../models/User';
export const getVerifiedCustomers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const skip = (page - 1) * limit;
        const query = { kycStatus: 'VERIFIED', role: 'user' };
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { fullName: searchRegex },
                { accountNumber: searchRegex }
            ];
        }
        const [customers, total] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(query)
        ]);
        res.status(200).json({
            success: true,
            data: customers,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total,
                limit
            }
        });
    }
    catch (error) {
        console.error('Error fetching verified customers:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
//# sourceMappingURL=customer.controller.js.map