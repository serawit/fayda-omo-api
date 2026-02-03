import oracledb from 'oracledb';

export interface CoreBankingCustomer {
  accountNumber: string;
  fullName: string;
  phoneNumber: string;
  status: 'ACTIVE' | 'DORMANT' | 'CLOSED';
  email?: string;
  cif?: string;
}

/**
 * Mocks the lookup of a customer in the Core Banking System (Flexcube/Oracle).
 * In production, this would use `oracledb` to query the real database.
 */
export const lookupCoreBankingCustomer = async (accountNumber: string): Promise<CoreBankingCustomer | null> => {
  // 1. Real Oracle Implementation (Production)
  // Check if Oracle credentials are provided. If so, attempt real connection.
  const useRealCbs = !!process.env.ORACLE_CONNECT_STRING && process.env.FORCE_MOCK_CBS !== 'true';

  if (useRealCbs) {
    let connection;
    try {
      console.log(`[CBS] Connecting to Oracle DB...`);
      connection = await oracledb.getConnection({
        user: process.env.ORACLE_USER,
        password: process.env.ORACLE_PASSWORD,
        connectString: process.env.ORACLE_CONNECT_STRING,
        // Increase connection timeout to 30 seconds to handle slow networks
        transportConnectTimeout: 30000,
      });

      // Example Query: Adjust table/column names to match your Flexcube schema
      // Common table: STTM_CUST_ACCOUNT or similar
      const sql = `
        SELECT CUST_AC_NO, AC_DESC, MOBILE_NO, AC_STAT_NO, EMAIL, CUST_NO 
        FROM STTM_CUST_ACCOUNT 
        WHERE CUST_AC_NO = :accountNumber
      `;

      const result = await connection.execute<any>(sql, [accountNumber], {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });

      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0];
        console.log(`[CBS] Account ${accountNumber} found in Oracle DB.`);
        return {
          accountNumber: row.CUST_AC_NO,
          fullName: row.AC_DESC,
          phoneNumber: row.MOBILE_NO, // Ensure this column exists
          status: row.AC_STAT_NO === 'A' ? 'ACTIVE' : 'CLOSED', // Map status codes
          email: row.EMAIL,
          cif: row.CUST_NO,
        };
      }
      console.log(`[CBS] Account ${accountNumber} not found in Oracle DB.`);
      return null;
    } catch (err: any) {
      if (err.code === 'NJS-510' || err.code === 'NJS-503' || err.message?.includes('ETIMEDOUT')) {
        console.error(`[CBS] CRITICAL: Oracle DB unreachable (${err.code}). Check VPN connection to ${process.env.ORACLE_CONNECT_STRING}.`);
      } else {
        console.error('[CBS] Oracle Lookup Error:', err);
      }
      return null;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (e) {
          console.error('Error closing Oracle connection:', e);
        }
      }
    }
  }

  console.warn('[CBS] ORACLE_CONNECT_STRING not set. Using Mock Data.');
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 300));

  // 1. Define Mock Data for specific test accounts
  const mockDatabase: Record<string, CoreBankingCustomer> = {
    '1091880213324801': {
      accountNumber: '1091880213324801',
      fullName: 'serawit seba',
      phoneNumber: '0913996975',
      status: 'ACTIVE',
      email: 'abebe@example.com',
      cif: '10001'
    },
    '1234567890123456': {
      accountNumber: '1234567890123456',
      fullName: 'Test User',
      phoneNumber: '0911000000',
      status: 'ACTIVE',
      cif: '10002'
    }
  };

  // 2. Return specific mock if found
  if (mockDatabase[accountNumber]) {
    return mockDatabase[accountNumber];
  }

  // 3. Return null if account not found (simulating invalid account)
  return null;
};