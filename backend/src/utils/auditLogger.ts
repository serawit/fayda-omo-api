import { Request } from 'express';
import crypto from 'crypto';

export const logAudit = (
  req: Request,
  context: {
    action: string;
    accountNumber?: string;
    faydaId?: string;
    result: 'SUCCESS' | 'FAILURE';
    errorCode?: string | number;
    message?: string;
  }
) => {
  // 1. Timestamp
  const timestamp = new Date().toISOString();
  
  // 2. IP Address (Anonymized last octet)
  let ip = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress || '0.0.0.0';
  if (ip.includes(',')) ip = ip.split(',')[0].trim();

  if (ip.includes('.')) {
    // IPv4: Replace last octet with 0 (e.g., 192.168.1.50 -> 192.168.1.0)
    ip = ip.replace(/\.\d+$/, '.0');
  }

  // 3. Masked Account Number (Show last 4)
  const maskedAccount = context.accountNumber 
    ? context.accountNumber.replace(/.(?=.{4})/g, '*') 
    : undefined;

  // 4. Masked Fayda FAN (Show last 4)
  const maskedFan = context.faydaId 
    ? context.faydaId.replace(/.(?=.{4})/g, '*') 
    : undefined;

  // 6. Trace/Request ID
  const traceId = (req.headers['x-request-id'] as string) || crypto.randomUUID();

  const logEntry = {
    timestamp,
    ip,
    accountNumber: maskedAccount,
    faydaId: maskedFan,
    result: context.result,
    errorCode: context.errorCode,
    traceId,
    action: context.action,
    message: context.message
  };

  // Output as JSON for ingestion systems (ELK, Splunk, etc.)
  console.log(JSON.stringify(logEntry));
};