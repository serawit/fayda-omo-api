import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
dotenv.config();
const seed = async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/fayda-omo';
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');
        const demoUsers = [
            {
                fullName: 'Abebe Bikila',
                phoneNumber: '0911223344',
                accountNumber: '10001',
                kycStatus: 'VERIFIED',
                isHarmonized: true,
                linkedAccounts: ['10002', 'SAV-998877']
            },
            {
                fullName: 'Kebede Tadesse',
                phoneNumber: '0922334455',
                accountNumber: '20002',
                kycStatus: 'PENDING',
                isHarmonized: false,
                linkedAccounts: ['20003']
            }
        ];
        console.log('\n🌱 Seeding Users...');
        for (const u of demoUsers) {
            await User.findOneAndUpdate({ phoneNumber: u.phoneNumber }, u, { upsert: true, new: true });
            console.log(`   ✅ Seeded: ${u.fullName} (Acc: ${u.accountNumber})`);
        }
        console.log('\n👉 Use Account Numbers "10001" or "20002" to test the frontend flow.');
        console.log('👉 Use Phone "0911223344" for login tests.\n');
    }
    catch (error) {
        console.error('Seed error:', error);
    }
    finally {
        await mongoose.disconnect();
    }
};
seed();
//# sourceMappingURL=seed.js.map