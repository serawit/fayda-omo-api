import mongoose, { Schema } from 'mongoose';
const FaydaCustomerSchema = new Schema({
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
export default mongoose.model('FaydaCustomer', FaydaCustomerSchema);
//# sourceMappingURL=CustomerFayda.js.map