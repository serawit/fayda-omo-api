import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  fullName: string;
  phoneNumber: string;
  accountNumber: string;
  kycStatus: 'PENDING' | 'VERIFIED' | 'FAILED';
  isHarmonized: boolean;
  linkedAccounts: string[];
  faydaId?: string;
  email?: string;
  username?: string;
  password?: string;
  role?: string;
  address?: string;
}

const UserSchema: Schema = new Schema({
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

export default mongoose.model<IUser>('User', UserSchema);