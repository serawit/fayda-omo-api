import axios from 'axios';

export const sendSms = async (to: string, message: string): Promise<boolean> => {
  const provider = process.env.SMS_PROVIDER || 'mock'; // Options: 'mock', 'twilio', 'ethio'

  try {
    if (provider === 'twilio') {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_FROM_NUMBER;

      if (!accountSid || !authToken || !fromNumber) {
        console.error('❌ Twilio configuration missing in .env');
        return false;
      }

      // Twilio API requires Basic Auth and Form Data
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        new URLSearchParams({
          To: to,
          From: fromNumber,
          Body: message,
        }),
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      console.log(`[SMS] Sent via Twilio to ${to}`);
      return true;
    } else if (provider === 'ethio') {
      // EthioTelecom / Local Aggregator implementation
      // Adjust payload based on specific Omo Bank Gateway documentation
      const apiUrl = process.env.ETHIO_SMS_URL;
      const apiKey = process.env.ETHIO_SMS_API_KEY;
      const senderId = process.env.ETHIO_SMS_SENDER_ID || 'OmoBank';

      if (!apiUrl) {
        console.error('❌ EthioTelecom SMS URL missing in .env');
        return false;
      }

      await axios.post(apiUrl, {
        to,
        message,
        sender_id: senderId,
        api_key: apiKey,
      });
      console.log(`[SMS] Sent via EthioTelecom to ${to}`);
      return true;
    } else {
      // Default Mock (Development)
      console.log('\n=================================================');
      console.log(`📱 SMS SIMULATION (Provider: ${provider})`);
      console.log(`To:      ${to}`);
      console.log(`Message: ${message}`);
      console.log('=================================================');
      return true;
    }
  } catch (error: any) {
    console.error(
      `[SMS ERROR] Failed to send to ${to}:`,
      error.response?.data || error.message
    );
    return false;
  }
};