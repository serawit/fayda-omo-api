// Simple in-memory store for development (Map<phoneNumber, {code, expires}>)
const otpStore = new Map<string, { code: string; expires: number }>();

export const sendOtp = async (phoneNumber: string): Promise<string> => {
  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store with 5-minute expiration
  otpStore.set(phoneNumber, {
    code,
    expires: Date.now() + 5 * 60 * 1000
  });

  // MOCK: Log to console instead of sending real SMS
  console.log(`[MOCK SMS] 🔐 OTP for ${phoneNumber} is: ${code}`);
  
  return code;
};

export const verifyOtp = async (phoneNumber: string, code: string): Promise<boolean> => {
  const record = otpStore.get(phoneNumber);
  
  if (!record) return false;
  
  if (Date.now() > record.expires) {
    otpStore.delete(phoneNumber);
    return false;
  }
  
  if (record.code === code) {
    otpStore.delete(phoneNumber); // Consume OTP so it can't be used twice
    return true;
  }
  
  return false;
};
