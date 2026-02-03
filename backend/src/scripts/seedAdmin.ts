import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.DB_URI || 'mongodb://localhost:27017/fayda-omo';
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    const adminEmail = 'admin@omobank.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('⚠️ Admin user already exists');
      return;
    }

    // Create new admin user
    // NOTE: If your User model does not have a pre-save hook to hash passwords,
    // you should hash this password using bcrypt before saving.
    const newAdmin = new User({
      fullName: 'Admin',
      email: adminEmail,
      username: 'admin',
      password: 'admin', // Change this in production!
      role: 'admin',
      phoneNumber: '+251911000001',
      accountNumber: 'ADMIN_ACC_001', // Placeholder to satisfy unique constraints
      kycStatus: 'VERIFIED'
    });

    await newAdmin.save();
    console.log('🚀 Admin user created successfully');
    console.log(`👉 Email: ${adminEmail}`);
    console.log(`👉 Password: admin`);

  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

seedAdmin();