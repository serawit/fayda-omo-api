import { Request, Response } from 'express';
import { lookupCoreBankingCustomer, getCBSCustomers } from '../services/coreBanking.service.js';

export const getCustomerByAccount = async (req: Request, res: Response) => {
  try {
    const { accountNumber } = req.params;
    if (!accountNumber) {
      return res.status(400).json({ success: false, message: 'Account number is required' });
    }

    const customer = await lookupCoreBankingCustomer(accountNumber);
    
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found in CBS' });
    }

    res.status(200).json({ success: true, data: customer });
  } catch (error: any) {
    console.error('CBS Controller Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

export const getCustomerReports = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const reports = await getCBSCustomers(limit);
    
    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (error: any) {
    console.error('CBS Report Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report', error: error.message });
  }
};