import mongoose, { Schema } from 'mongoose';
const HarmonizationLogSchema = new Schema({
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
}, { timestamps: true });
export default mongoose.model('HarmonizationLog', HarmonizationLogSchema);
//# sourceMappingURL=HarmonizationLog.js.map