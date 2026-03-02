import smpp from 'smpp';
import { Pdu } from 'smpp';
import fs from 'fs';
import path from 'path';

// Configuration derived from the provided XML
const SMSC_HOST = process.env.SMSC_HOST || process.env.SMPP_HOST || '10.204.181.70';
const SMSC_PORT = parseInt(process.env.SMSC_PORT || process.env.SMPP_PORT || '5019', 10);
const SYSTEM_ID = process.env.SMPP_USERNAME || process.env.SMPP_SYSTEM_ID || '6818';
const PASSWORD = process.env.SMPP_PASSWORD || 'pass#123';
const SENDER_ID = process.env.SMPP_SENDER_ADDRESS || process.env.SMPP_SENDER_ID || '6818';
const USE_SSL = process.env.SMPP_USE_SSL === 'true';
const CA_CERT_PATH = process.env.SMPP_CA_CERT_PATH;

let session: smpp.Session | null = null;
let isConnected = false;
let retryAttempt = 0; // Initialize retry attempt counter

const getSmppStatusMessage = (status: number): string => {
  switch (status) {
    case 0: return 'ESME_ROK (Success)';
    case 1: return 'ESME_RINVMSGLEN (Message Length Invalid)';
    case 2: return 'ESME_RINVCMDLEN (Command Length Invalid)';
    case 3: return 'ESME_RINVCMDID (Invalid Command ID)';
    case 4: return 'ESME_RINVBNDSTS (Incorrect BIND Status)';
    case 5: return 'ESME_RALYBND (Already in Bound State)';
    case 8: return 'ESME_RSYSERR (System Error)';
    case 13: return 'ESME_RBINDFAIL (Bind Failed)';
    case 14: return 'ESME_RINVPASWD (Invalid Password)';
    case 15: return 'ESME_RINVSYSID (Invalid System ID)';
    case 88: return 'ESME_RTHROTTLED (Throttling error)';
    default: return `Unknown Status (${status})`;
  }
};

/**
 * Initializes the SMPP connection and handles reconnection logic.
 */
export const initSmpp = (): void => {
  retryAttempt++; // Increment retry attempt
  console.log(`[SMPP] Connecting to ${SMSC_HOST}:${SMSC_PORT} as ${SYSTEM_ID} (SSL: ${USE_SSL})...`);
  console.log(`[SMPP] Debug: Password length is ${PASSWORD.length} characters.`);

  let tlsOptions: any = undefined;
  if (USE_SSL) {
    if (CA_CERT_PATH) {
      try {
        const certPath = path.resolve(CA_CERT_PATH);
        tlsOptions = {
          ca: fs.readFileSync(certPath),
          rejectUnauthorized: true
        };
        console.log(`[SMPP] Loaded CA certificate from ${certPath}`);
      } catch (err: any) {
        console.error(`[SMPP] Failed to load CA certificate: ${err.message}. Falling back to insecure connection.`);
        tlsOptions = { rejectUnauthorized: false };
      }
    } else {
      tlsOptions = { rejectUnauthorized: false };
    }
  }

  session = smpp.connect({
    url: `${USE_SSL ? 'ssmpp' : 'smpp'}://${SMSC_HOST}:${SMSC_PORT}`,
    auto_enquire_link_period: 30000, // Keep connection alive
    debug: false,
    tls: tlsOptions
  });

  // Handle connection and binding
  session.on('connect', () => {
    console.log('[SMPP] Socket connected. Binding...');
    
    const bindParams = {
      system_id: SYSTEM_ID,
      password: PASSWORD,
      interface_version: 0x34, // Specify SMPP v3.4, a common requirement
      // Allow empty string if defined in env, otherwise default to empty string (common for Ethio Telecom)
      system_type: process.env.SMPP_SYSTEM_TYPE !== undefined ? process.env.SMPP_SYSTEM_TYPE : '',
      addr_ton: parseInt(process.env.SMPP_ADDR_TON || '0', 10),
      addr_npi: parseInt(process.env.SMPP_ADDR_NPI || '0', 10),
    };

    console.log(`[SMPP] Binding with params: system_type='${bindParams.system_type}', ton=${bindParams.addr_ton}, npi=${bindParams.addr_npi}`);

    session?.bind_transceiver(bindParams, (pdu: Pdu) => {
      if (pdu.command_status === 0) {
        console.log('[SMPP] Successfully bound as Transceiver.');
        isConnected = true;
        
      } else {
        const statusMsg = getSmppStatusMessage(pdu.command_status);
        console.error(`[SMPP] Bind failed. Status: ${pdu.command_status} - ${statusMsg}`);
        if (pdu.command_status === 8) {
          console.error('💡 HINT: This is a generic system error from the SMSC. If this persists after the update, the most likely cause is that your server\'s IP address is not whitelisted by the SMSC provider.');
        }
        session?.close();
      }
    });
  });

  session.on('close', () => {
    console.warn('[SMPP] Connection closed.');
    isConnected = false;
    session = null;
    // Exponential backoff: 2^attempt * 1000 ms (1s, 2s, 4s, 8s, etc.)
    const delay = Math.min(Math.pow(2, retryAttempt) * 1000, 60000); // Cap at 60 seconds
    console.log(`[SMPP] Attempting reconnection in ${delay / 1000} seconds...`);
    setTimeout(initSmpp, delay);
  });
  
  session.on('error', (err: Error) => {
    console.error('[SMPP] Error:', err.message);
    // Error usually triggers close, which handles reconnection
  });
};

/**
 * Sends an OTP or SMS message via the established SMPP connection.
 * @param to Recipient phone number (e.g., 251911223344)
 * @param text Message content
 */
export const sendSmsSMPP = (to: string, text: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!session || !isConnected) {
      console.error('[SMPP] Send failed: SMPP session is not connected or bound. Check for initial bind errors.');
      return reject(new Error('SMPP session is not connected.'));
    }

    // Ensure 'to' number format is correct (remove + if present, etc.)
    const destinationAddr = to.replace('+', '');

    session.submit_sm({
      destination_addr: destinationAddr,
      short_message: text,
      source_addr: SENDER_ID,
      registered_delivery: 1, // Request delivery receipt
      // Default encoding (usually GSM 7-bit)
      data_coding: 0, 
    }, (pdu: Pdu) => {
      if (pdu.command_status === 0) {
        console.log(`[SMPP] Message sent to ${destinationAddr}. ID: ${pdu.message_id}`);
        resolve(pdu.message_id || 'SENT');
      } else {
        console.error(`[SMPP] Failed to send to ${destinationAddr}. Status: ${pdu.command_status}`);
        reject(new Error(`SMPP Submit failed with status ${pdu.command_status}`));
      }
    });
  });
};

/**
 * Health check for the SMPP service
 */
export const checkSmsHealth = (): boolean => {
  return isConnected;
};

/**
 * Gracefully closes the SMPP connection.
 * Used during server shutdown to prevent hanging processes.
 */
export const closeSmpp = async (): Promise<void> => {
  if (session) {
    console.log('[SMPP] Gracefully closing connection...');
    // Remove the close listener to prevent auto-reconnection logic from firing during shutdown
    session.removeAllListeners('close');
    session.close();
    session = null;
    isConnected = false;
  }
};