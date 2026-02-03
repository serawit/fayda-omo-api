import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  // Standard Auth Fields
  email: string;
  password?: string;
  role: 'user' | 'admin' | 'teller';
  accountNumber?: string;
  
  // Fayda Identity Fields (Source of Truth: Fayda System)
  faydaId?: string; // The FIN (Fayda Identification Number)
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dob?: Date;
  gender?: 'M' | 'F';
  phoneNumber?: string;
  address?: string;

  // Sync & Verification Metadata
  nidVerified: boolean;
  faydaStatus?: 'ACTIVE' | 'SUSPENDED';
  lastNidSync?: Date;
  faydaSnapshot?: any; // Stores the raw JSON from the last successful sync
  
  // Manual Review / Fallback Fields
  reviewStatus: 'PENDING' | 'APPROVED' | 'FLAGGED' | 'REJECTED';
  reviewReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional if using OIDC-only auth
  role: { type: String, enum: ['user', 'admin', 'teller'], default: 'user' },
  accountNumber: { type: String, unique: true, sparse: true },

  // Fayda Fields
  faydaId: { type: String, index: true, sparse: true }, 
  firstName: { type: String },
  middleName: { type: String },
  lastName: { type: String },
  dob: { type: Date },
  gender: { type: String, enum: ['M', 'F'] },
  phoneNumber: { type: String },
  address: { type: String },

  // Sync Metadata
  nidVerified: { type: Boolean, default: false },
  faydaStatus: { type: String }, // e.g., 'ACTIVE', 'SUSPENDED'
  lastNidSync: { type: Date },
  faydaSnapshot: { type: Schema.Types.Mixed }, // Flexible storage for audit trail

  // Review Process (for Fallback scenarios)
  reviewStatus: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'FLAGGED', 'REJECTED'],
    default: 'PENDING'
  },
  reviewReason: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);