import oracledb from 'oracledb';

interface CoreBankingCustomer {
  fullName: string;
  phoneNumber: string | null;
  accountNumber: string;
  gender?: string;
  dateOfBirth?: Date;
  nationalId?: string;
  status?: string;
}

// Interface for the Frontend Display (Mapped)
export interface CBSFrontendData {
  cbsData: {
    fullName: string;
    accountNumber: string;
    phoneNumber: string;
    gender: string;
    status: string;
    openedDate: Date;
    address: string;
    nationalId: string;
  };
  // Mapped to align with FaydaCitizenData for comparison
  faydaMap: {
    firstName: string;
    middleName: string;
    lastName: string;
    gender: 'M' | 'F' | 'O';
    phoneNumber: string;
    status: 'ACTIVE' | 'SUSPENDED' | 'UNKNOWN';
    fin: string;
    dateOfBirth: string; // Added for comparison
  };
}

/**
 * Helper function to build the comprehensive customer lookup query.
 * This promotes reusability and ensures consistency.
 * @param joinCondition - The SQL condition to join DEPOSIT_ACCOUNT and CUSTOMER tables (e.g., 't2.PRIMARY_CUST_ID = t1.CUST_ID')
 */
function getCustomerQuery(joinCondition: string): string {
  return `
    SELECT
      t1.CUST_NM,
      t2.ACCT_NO,
      (SELECT MAX(cm.CONTACT) FROM customer_contact_mode cm WHERE cm.cust_id = t1.cust_id AND cm.contact_mode_id = (SELECT contact_mode_id FROM contact_mode_ref cr WHERE cr.contact_mode_desc LIKE '%Mobile Phone%')) AS CONTACT,
      p.GENDER_TY,
      p.BIRTH_DT,
      p.NATIONALITY_ID,
      t5.ADDR_LINE_1,
      CASE
        WHEN t1.rec_st = 'A' THEN 'Active' WHEN t1.rec_st = 'I' THEN 'Inactive'
        WHEN t1.rec_st = 'L' THEN 'Closed' WHEN t1.rec_st = 'S' THEN 'Submitted'
        WHEN t1.rec_st = 'D' THEN 'Dormant' WHEN t1.rec_st = 'E' THEN 'Escheated'
        WHEN t1.rec_st = 'N' THEN 'Non-accrual' WHEN t1.rec_st = 'Q' THEN 'Delinquent'
        WHEN t1.rec_st = 'C' THEN 'Cancelled' WHEN t1.rec_st = 'M' THEN 'Matured'
        WHEN t1.rec_st = 'W' THEN 'Write Off' WHEN t1.rec_st = 'U' THEN 'Unfunded'
        WHEN t1.rec_st = 'B' THEN 'Bad Debt'
        ELSE 'Unknown'
      END AS ACCOUNT_STATUS
    FROM DEPOSIT_ACCOUNT t2
    JOIN customer t1 ON ${joinCondition}
    LEFT JOIN PERSON p ON p.CUST_ID = t1.CUST_ID
    LEFT JOIN CUSTOMER_ADDRESS_INFO t5 ON t5.CUST_ID = t1.CUST_ID
    WHERE TRIM(t2.ACCT_NO) = TRIM(:accountNumber)
  `;
}

export async function lookupCoreBankingCustomer(accountNumber: string): Promise<CoreBankingCustomer | null> {
  // ---------------------------------------------------------
  // MOCK MODE: Bypass DB if MOCK_ORACLE=true in .env
  // ---------------------------------------------------------
  if (process.env.MOCK_ORACLE === 'true') {
    console.log(`[CBS] ⚠️ MOCK MODE: Returning dummy data for ${accountNumber}`);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency
    return {
      fullName: 'Adimasu Kero Gebre',
      phoneNumber: '+251911234567', // Mock phone for OTP testing
      accountNumber: accountNumber,
      gender: 'M',
      dateOfBirth: new Date('1990-01-01'),
      nationalId: '123456789',
      status: 'Active'
    };
  }

  let connection;
  try {
    // Add a check to ensure the pool was initialized on startup.
    if (!oracledb.getPool()) {
      throw new Error('Oracle connection pool is not available. Please check the database credentials in the .env file and restart the server.');
    }

    console.log('[CBS] Connecting to Oracle DB...');
    connection = await oracledb.getConnection();

    const executeQuery = async (joinCondition: string) => {
      const sql = getCustomerQuery(joinCondition);
      return await connection.execute<any>(sql, { accountNumber }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    };

    const mapRowToCustomer = (row: any): CoreBankingCustomer => {
      return {
        fullName: row.CUST_NM,
        phoneNumber: row.CONTACT || null,
        accountNumber: row.ACCT_NO, // This was ACCT_NO
        gender: row.GENDER_TY,
        dateOfBirth: row.BIRTH_DT,
        nationalId: row.NATIONALITY_ID,
        status: row.ACCOUNT_STATUS,
      };
    };

    // --- Professional Search Upgrade ---
    // Stage 1: Attempt lookup using the primary, most common join key.
    console.log('[CBS] Searching with primary join condition...');
    let result = await executeQuery('t2.PRIMARY_CUST_ID = t1.CUST_ID');
    if (result.rows && result.rows.length > 0) {
      const customer = mapRowToCustomer(result.rows[0]);
      console.log(`[CBS] Found customer (PRIMARY_CUST_ID Join): ${customer.fullName} (${customer.accountNumber}) - Contact: ${customer.phoneNumber}`);
      return customer;
    }

    // Stage 2: If primary fails, attempt lookup using the fallback join key.
    console.log('[CBS] Primary join failed. Searching with fallback join condition...');
    result = await executeQuery('t2.ACCT_ID = t1.CUST_ID');
    if (result.rows && result.rows.length > 0) {
      const customer = mapRowToCustomer(result.rows[0]);
      console.log(`[CBS] Found customer (ACCT_ID Join): ${customer.fullName} (${customer.accountNumber}) - Contact: ${customer.phoneNumber}`);
      return customer;
    }

    return null; // Customer not found
  } catch (err) {
    console.error('[CBS] Oracle Lookup Error:', err);
    throw err; // Re-throw to propagate the error
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing Oracle connection in CBS:', err);
      }
    }
  }
}

export async function getCBSCustomers(limit: number = 100): Promise<CBSFrontendData[]> {
  if (process.env.MOCK_ORACLE === 'true') {
    console.log('[CBS] ⚠️ MOCK MODE: Returning dummy report data.');
    return Array(5).fill(null).map((_, i) => ({
      cbsData: {
        fullName: `Mock Customer ${i + 1}`,
        accountNumber: `1000${Math.floor(Math.random() * 9000000)}`,
        phoneNumber: '+251911000000',
        gender: i % 2 === 0 ? 'M' : 'F',
        status: 'Active',
        openedDate: new Date(),
        address: 'Addis Ababa',
        nationalId: `NID-${Math.floor(Math.random() * 10000)}`,
        dateOfBirth: new Date('1990-01-01')
      },
      faydaMap: {
        firstName: 'Mock',
        middleName: 'Customer',
        lastName: `${i + 1}`,
        gender: i % 2 === 0 ? 'M' : 'F',
        phoneNumber: '+251911000000',
        status: 'ACTIVE',
        fin: `FIN-${Math.floor(Math.random() * 10000)}`,
        dateOfBirth: '1990-01-01'
      }
    }));
  }

  let connection;
  try {
    console.log('[CBS] Connecting to Oracle DB for Report...');

    connection = await oracledb.getConnection();

    // Updated SQL based on functional script provided
    const sql = `
      SELECT t1.CUST_NM, t2.ACCT_NO, (SELECT MAX(cm.CONTACT) FROM customer_contact_mode cm WHERE cm.cust_id = t1.cust_id AND cm.contact_mode_id = (SELECT contact_mode_id FROM contact_mode_ref cr WHERE cr.contact_mode_desc LIKE '%Mobile Phone%')) AS CONTACT, p.GENDER_TY, p.BIRTH_DT, p.NATIONALITY_ID,
        CASE                 
          WHEN t1.rec_st = 'A' THEN 'Active'
          WHEN t1.rec_st = 'I' THEN 'Inactive'
          WHEN t1.rec_st = 'L' THEN 'Closed'
          WHEN t1.rec_st = 'S' THEN 'Submitted'
          WHEN t1.rec_st = 'D' THEN 'Dormant'
          WHEN t1.rec_st = 'E' THEN 'Escheated'
          WHEN t1.rec_st = 'N' THEN 'Non-accrual'
          WHEN t1.rec_st = 'Q' THEN 'Delinquent'
          WHEN t1.rec_st = 'C' THEN 'Cancelled'
          WHEN t1.rec_st = 'M' THEN 'Matured'
          WHEN t1.rec_st = 'W' THEN 'Write Off'
          WHEN t1.rec_st = 'U' THEN 'Unfunded'
          WHEN t1.rec_st = 'B' THEN 'Bad Debt'
          WHEN t1.rec_st = 'P' THEN 'Pre-Dormant'
          WHEN t1.rec_st = 'R' THEN 'Rejected'
          WHEN t1.rec_st = 'O' THEN 'Rescinded'
          WHEN t1.rec_st = 'T' THEN 'Reversed'
          ELSE 'Unknown'
        END AS ACCOUNT_STATUS, 
        t2.OPENED_DT, t5.ADDR_LINE_1
      FROM customer t1
      LEFT JOIN DEPOSIT_ACCOUNT t2 ON t2.PRIMARY_CUST_ID = t1.CUST_ID -- Using the more reliable join
      LEFT JOIN PERSON p ON p.CUST_ID = t1.CUST_ID
      LEFT JOIN CUSTOMER_ADDRESS_INFO t5 ON t5.CUST_ID = t1.CUST_ID
      FETCH NEXT :limit ROWS ONLY
    `;
    
    const result = await connection.execute<any>(sql, [limit], {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });

    // Map the raw Oracle result to a clean structure for the frontend
    const mappedData: CBSFrontendData[] = (result.rows || []).map((row) => {
      // Naive name splitting for mapping
      const fullName = row.CUST_NM || '';
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
      const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : (nameParts.length === 2 ? nameParts[1] : '');

      return {
        cbsData: {
          fullName: fullName,
          accountNumber: row.ACCT_NO,
          phoneNumber: row.CONTACT || '',
          gender: row.GENDER_TY,
          status: row.ACCOUNT_STATUS,
          openedDate: row.OPENED_DT,
          address: row.ADDR_LINE_1 || '',
          nationalId: row.NATIONALITY_ID || ''
        },
        faydaMap: {
          firstName,
          middleName,
          lastName,
          gender: (row.GENDER_TY === 'M' || row.GENDER_TY === 'Male') ? 'M' : (row.GENDER_TY === 'F' || row.GENDER_TY === 'Female') ? 'F' : 'O',
          phoneNumber: row.CONTACT || '',
          status: row.ACCOUNT_STATUS === 'Active' ? 'ACTIVE' : 'SUSPENDED',
          fin: row.NATIONALITY_ID || '', // Assuming National ID maps to FIN
          dateOfBirth: row.BIRTH_DT ? new Date(row.BIRTH_DT).toISOString().split('T')[0] : ''
        }
      };
    });

    return mappedData;
  } catch (err) {
    console.error('[CBS] Oracle Report Error:', err);
    throw err;
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { console.error(e); }
    }
  }
}