import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const DB_URI = process.env.DB_URI;
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
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
        await User.deleteMany({});
        console.log('🧹 Cleared existing users');
        const testUsers = [
            {
                username: 'admin',
                password: 'password123',
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
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}
seedDatabase();
//# sourceMappingURL=seedData.js.map