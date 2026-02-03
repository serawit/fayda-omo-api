import mongoose, { Schema, Document } from 'mongoose';

export interface IHarmonization extends Document {
  fan: string;
  accountNumber: string;
  status: 'PENDING' | 'VERIFIED' | 'FAILED';
  otp?: string;
  otpExpires?: Date;
}

const HarmonizationSchema: Schema = new Schema({
  fan: { type: String, required: true, unique: true },
  accountNumber: { type: String, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'FAILED'],
    default: 'PENDING',
  },
  otp: { type: String },
  otpExpires: { type: Date },
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      // Use destructuring for a type-safe transformation
      const { _id, __v, ...object } = ret;
      object.id = _id;
      return object;
    },
  },
});

export default mongoose.model<IHarmonization>('Harmonization', HarmonizationSchema);