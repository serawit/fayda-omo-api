import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DB_URI = process.env.DB_URI;

// Define a basic User schema for seeding
// Note: In a real application, you should import this from your models directory
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // In production, ensure this is hashed!
  role: { type: String, default: 'staff' },
  fullName: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  if (!DB_URI) {
    console.error('❌ Error: DB_URI is not defined in your .env file.');
    process.exit(1);
  }

  try {
    await mongoose.connect(DB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    console.log('🧹 Cleared existing users');

    // Define test data
    const testUsers = [
      {
        username: 'admin',
        password: 'password123', // Ideally, use bcrypt to hash this
        role: 'admin',
        fullName: 'System Administrator'
      },
      {
        username: 'staff',
        password: 'password123',
        role: 'staff',
        fullName: 'Omo Bank Staff'
      }
    ];

    await User.insertMany(testUsers);
    console.log(`✨ Successfully seeded ${testUsers.length} users`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();