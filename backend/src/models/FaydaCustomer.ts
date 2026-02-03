// src/models/FaydaCustomer.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IFaydaCustomer extends Document {
  accountNumber: string;
  faydaNumber: string;           // empty until harmonized
  fullName: string;
  phoneNumber: string;
  gender?: string;
  dob?: Date;
  nationality?: string;
  address?: string;
  photoUrl?: string;
  email?: string;

  status: string;                // 'ACTIVE' | 'INACTIVE' | ...
  isHarmonized: boolean;
  harmonizedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const FaydaCustomerSchema = new Schema<IFaydaCustomer>(
  {
    accountNumber: { type: String, required: true, unique: true, trim: true, index: true },
    faydaNumber: { type: String, unique: true, sparse: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['M', 'F', 'Other', null], default: null },
    dob: { type: Date, default: null },
    nationality: { type: String, default: null },
    address: String,
    photoUrl: String,
    email: { type: String, trim: true, lowercase: true },

    status: { type: String, required: true },
    isHarmonized: { type: Boolean, default: false },
    harmonizedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const FaydaCustomer: Model<IFaydaCustomer> =
  mongoose.models.FaydaCustomer || mongoose.model<IFaydaCustomer>('FaydaCustomer', FaydaCustomerSchema);

export default FaydaCustomer;