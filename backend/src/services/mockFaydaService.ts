// Simulates external calls to the Fayda (National ID) System

export const validateFan = async (fan: string): Promise<{ valid: boolean; fullName?: string }> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Mock Logic: FANs starting with '0000' are considered invalid/non-existent
  if (fan.startsWith('0000')) {
    throw new Error('Fayda ID not found in national registry');
  }

  return { 
    valid: true, 
    fullName: "Abebe Kebede" // In a real app, this comes from Fayda
  };
};

export const verifyFace = async (fan: string, faceImageBase64: string): Promise<boolean> => {
  // Simulate network delay (processing image)
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock Logic: Always return true for dev unless FAN is specific failure case
  if (fan.endsWith('9999')) return false;
  return true;
};
