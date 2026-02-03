import mongoose, { Schema } from 'mongoose';
const UserSchema = new Schema({
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    accountNumber: { type: String, required: true, unique: true },
    kycStatus: { type: String, enum: ['PENDING', 'VERIFIED', 'FAILED'], default: 'PENDING' },
    isHarmonized: { type: Boolean, default: false },
    linkedAccounts: { type: [String], default: [] },
    faydaId: { type: String },
    email: { type: String, unique: true, sparse: true },
    username: { type: String },
    password: { type: String },
    role: { type: String, default: 'user' },
    address: { type: String }
}, { timestamps: true });
export default mongoose.model('User', UserSchema);
//# sourceMappingURL=User.js.map