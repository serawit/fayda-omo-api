import mongoose, { Schema, Document } from 'mongoose';

export interface IFaydaCustomer extends Document {
  accountNumber: string;
  faydaNumber: string;
  fullName: string;
  phoneNumber: string;
  gender?: string;
  dob?: Date;
  nationality?: string;
  address?: string;
  photoUrl?: string;
  email?: string;
  status: string;
  isHarmonized: boolean;
  harmonizedAt?: Date;
}

const FaydaCustomerSchema: Schema = new Schema({
  accountNumber: { type: String, required: true, unique: true },
  faydaNumber: { type: String, required: true },
  fullName: { type: String, required: true },
  phoneNumber: { type: String },
  gender: { type: String },
  dob: { type: Date },
  nationality: { type: String, default: 'ET' },
  address: { type: String },
  photoUrl: { type: String },
  email: { type: String },
  status: { type: String, default: 'active' },
  isHarmonized: { type: Boolean, default: false },
  harmonizedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model<IFaydaCustomer>('FaydaCustomer', FaydaCustomerSchema);