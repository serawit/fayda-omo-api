export const SmsTemplates = {
  otp: (otp: string, validityMinutes: number = 3) => 
    `Dear Customer, Use OTP ${otp} to verify your account. Valid for ${validityMinutes} minutes. For your security, do not share this code with anyone. - Omo Bank_KYC`,
  
  kycApproved: () => 
    `Dear Customer, your KYC has been APPROVED. - Omo Bank_KYC`,
  
  kycRejected: (reason?: string) => 
    `Dear Customer, your KYC application could not be processed${reason ? ': ' + reason : ''}. Please visit the nearest branch. - Omo Bank_KYC`
};