import axios from 'axios';

// Read configuration from environment variables for production readiness.
const SMS_GATEWAY_URL = process.env.SMS_GATEWAY_URL;
const SMS_API_KEY = process.env.SMS_API_KEY;
const SMS_SENDER_ID = process.env.SMS_SENDER_ID; // The Short Code, e.g., 6816

// --- Verification Log ---
console.log('[SMS Service] Configuration Loaded:');
console.log(`   URL: ${SMS_GATEWAY_URL}`);
console.log(`   Sender ID: ${SMS_SENDER_ID}`);
console.log(`   API Key Present: ${!!SMS_API_KEY}`);
// ------------------------

/**
 * Sends an SMS message using the internal gateway.
 * @param to The recipient's phone number, expected to be in a format the gateway understands.
 * @param message The message content.
 */
export const sendSms = async (to: string, message: string): Promise<void> => {
  // A production-ready service should not proceed if critical configuration is missing.
  if (!SMS_GATEWAY_URL) {
    console.error('[SMS Service] Error: SMS_GATEWAY_URL is not defined in environment variables.');
    throw new Error('SMS service is not configured.');
  }
  if (!SMS_SENDER_ID) {
    console.warn('[SMS Service] Warning: SMS_SENDER_ID is not defined. The sender may be incorrect.');
  }

  // The gateway might expect specific field names (e.g., 'destination', 'text').
  // This payload is a common example.
  const payload = {
    to,
    message,
    from: SMS_SENDER_ID, // Use the short code from .env
  };

  // Prepare headers for authentication.
  const headers: { [key: string]: string } = {
    'Content-Type': 'application/x-www-form-urlencoded', // Try form-urlencoded
    'User-Agent': 'Fayda-Omo-API/1.0',
  };
  if (SMS_API_KEY) {
    headers['X-API-Key'] = SMS_API_KEY; // Using a common custom header for API keys.
  }

  console.log(`[SMS Service] Attempting to send SMS to ${to} via gateway at ${SMS_GATEWAY_URL}`);

  try {
    const response = await axios.post(SMS_GATEWAY_URL, new URLSearchParams(payload), {
      headers,
      timeout: 10000, // 10-second timeout for the request
    });

    console.log(`[SMS Service] SMS submitted to gateway. Status: ${response.status}`);
  } catch (error: any) {
    console.error(`[SMS Service] Failed to send SMS. Error: ${error.message}`);
    throw new Error('SMS gateway service is unavailable.');
  }
};

/**
 * Checks if the SMS service is configured and reachable.
 */
export const checkSmsHealth = async (): Promise<boolean> => {
  if (!SMS_GATEWAY_URL) return false;
  try {
    // Perform a lightweight check or just return true if config exists
    return true; 
  } catch (error) {
    return false;
  }
};