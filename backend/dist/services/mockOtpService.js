const otpStore = new Map();
export const sendOtp = async (phoneNumber) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(phoneNumber, {
        code,
        expires: Date.now() + 5 * 60 * 1000
    });
    console.log(`[MOCK SMS] 🔐 OTP for ${phoneNumber} is: ${code}`);
    return code;
};
export const verifyOtp = async (phoneNumber, code) => {
    const record = otpStore.get(phoneNumber);
    if (!record)
        return false;
    if (Date.now() > record.expires) {
        otpStore.delete(phoneNumber);
        return false;
    }
    if (record.code === code) {
        otpStore.delete(phoneNumber);
        return true;
    }
    return false;
};
//# sourceMappingURL=mockOtpService.js.map