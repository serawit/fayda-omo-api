import mongoose, { Schema } from 'mongoose';
const HarmonizationSchema = new Schema({
    fan: {
        type: String,
        required: [true, 'Fayda ID (FAN) is required'],
        trim: true,
        minlength: [16, 'FAN must be exactly 16 digits'],
        maxlength: [16, 'FAN must be exactly 16 digits'],
        index: true,
    },
    accountNumber: {
        type: String,
        required: [true, 'Bank account number is required'],
        trim: true,
        index: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'VERIFIED', 'FAILED'],
        default: 'PENDING',
        required: true,
        index: true,
    },
    verificationMethod: {
        type: String,
        enum: ['OTP', 'FACE'],
        default: null,
    },
    verifiedAt: {
        type: Date,
        default: null,
    },
    linkedAccounts: {
        type: [String],
        default: [],
    },
}, {
    timestamps: true,
    toJSON: {
        transform: (_doc, ret) => {
            delete ret.__v;
            return ret;
        },
    },
});
HarmonizationSchema.index({ fan: 1, accountNumber: 1 }, { unique: true });
HarmonizationSchema.index({ status: 1, createdAt: -1 });
HarmonizationSchema.virtual('isRecentlyVerified').get(function () {
    if (!this.verifiedAt)
        return false;
    return Date.now() - this.verifiedAt.getTime() < 24 * 60 * 60 * 1000;
});
HarmonizationSchema.statics.findLatestByFan = async function (fan) {
    return this.findOne({ fan }).sort({ createdAt: -1 }).lean();
};
const Harmonization = mongoose.model('Harmonization', HarmonizationSchema);
export default Harmonization;
//# sourceMappingURL=Harmonization.js.map