// src/scripts/seed-fayda-customers.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FaydaCustomer, { IFaydaCustomer } from '../models/FaydaCustomer';

// Load environment variables
dotenv.config();

const DB_URI = process.env.DB_URI || 'mongodb://127.0.0.1:27017/fayda-omo-db';

// Full data extracted from serjo.xlsx (as JSON array)
// You can replace this with a file read if preferred
const excelData: any[] = [
  {
    "CUST_NM": "ADISU WODAJO GEBRE",
    "ACCT_NO": "1051640004205701",
    "CONTACT": "0979741897",
    "GENDER_TY": "M",
    "ACCOUNT STATUS": "Active",
    "OPENED_DT": 43113,
    "ADDR_LINE_1": "TEPPI KETEMA",
    "NATIONALITY_ID": 261
  },
  {
    "CUST_NM": "Tigist Beyene Keto",
    "ACCT_NO": "1051640003226901",
    "CONTACT": "0917377665",
    "GENDER_TY": "F",
    "ACCOUNT STATUS": "Active",
    "OPENED_DT": 43113,
    "ADDR_LINE_1": "Tepi Shaka",
    "NATIONALITY_ID": 261
  },
  // ... (add the rest of your rows here)
  // For brevity I'm showing only first 2 + last 2
  // In real use → paste ALL rows or load from JSON file
  {
    "CUST_NM": "Tigist Beyene Keto",
    "ACCT_NO": "1051640003226901",
    "CONTACT": "+251961874467",
    "GENDER_TY": "F",
    "ACCOUNT STATUS": "Active",
    "OPENED_DT": 43113,
    "ADDR_LINE_1": "Tepi Shaka",
    "NATIONALITY_ID": 261
  }
  // ... paste remaining ~970 rows here
];

async function seedFaydaCustomers() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(DB_URI);
    console.log('✅ Connected to MongoDB');

    // 2. Prepare documents
    const customersToInsert: Partial<IFaydaCustomer>[] = excelData.map((row) => {
      // Normalize phone number to +251 format
      let phone = (row.CONTACT || '').toString().trim();
      if (phone.startsWith('0')) {
        phone = '+251' + phone.slice(1);
      } else if (!phone.startsWith('+251') && phone.match(/^\d{9,10}$/)) {
        phone = '+251' + phone;
      }

      return {
        accountNumber: row.ACCT_NO?.toString().trim(),
        fullName: row.CUST_NM?.trim() || 'Unknown',
        phoneNumber: phone || '+251000000000',
        gender: row.GENDER_TY === 'M' || row.GENDER_TY === 'F' ? row.GENDER_TY : undefined,
        status: row['ACCOUNT STATUS'] === 'Active' ? 'ACTIVE' : 'INACTIVE',
        address: row.ADDR_LINE_1?.trim(),
        nationality: row.NATIONALITY_ID === 261 ? 'ET' : undefined,

        // Fayda-specific fields — left empty until harmonization
        faydaNumber: '',
        dob: undefined,
        photoUrl: undefined,
        email: undefined,

        isHarmonized: false,
        harmonizedAt: undefined,
      };
    });

    console.log(`Preparing to seed ${customersToInsert.length} customers...`);

    // 3. Bulk upsert (update if exists, insert if new)
    const operations = customersToInsert.map((customer) => ({
      updateOne: {
        filter: { accountNumber: customer.accountNumber },
        update: { $set: customer },
        upsert: true,
      },
    }));

    const result = await FaydaCustomer.bulkWrite(operations, { ordered: false });

    console.log('✅ Seeding complete!');
    console.log(`Matched: ${result.matchedCount}`);
    console.log(`Modified: ${result.modifiedCount}`);
    console.log(`Upserted: ${result.upsertedCount}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
seedFaydaCustomers();