// src/models/HarmonizationLog.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHarmonizationLog extends Document {
  user: string;
  fullName?: string;
  status: 'Successful' | 'Pending' | 'Failed';
  timestamp: Date;
  accountNumber?: string;
  fan?: string;
}

const HarmonizationLogSchema: Schema = new Schema(
  {
    user: { type: String, required: true },
    fullName: { type: String },
    status: {
      type: String,
      enum: ['Successful', 'Pending', 'Failed'],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    accountNumber: { type: String },
    fan: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model<IHarmonizationLog>('HarmonizationLog', HarmonizationLogSchema);