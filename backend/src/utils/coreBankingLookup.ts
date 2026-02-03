// src/utils/coreBankingLookup.ts
import FaydaCustomer from '../models/FaydaCustomer';

export const lookupCoreBankingCustomer = async (accountNumber: string) => {
  await new Promise((r) => setTimeout(r, 300)); // simulate latency

  const customer = await FaydaCustomer.findOne({ accountNumber }).lean();

  if (!customer) return null;

  return {
    accountNumber: customer.accountNumber,
    phoneNumber: customer.phoneNumber,
    fullName: customer.fullName,
    status: customer.status,
  };
};