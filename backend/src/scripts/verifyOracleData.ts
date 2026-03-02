import oracledb from 'oracledb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk'; // npm install chalk (optional - comment out if not needed)

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function verifyOracleData() {
  let connection: oracledb.Connection | undefined;

  try {
    console.log(chalk.cyan('🔌 Connecting to Oracle Database...'));
    console.log(chalk.gray(`   Target: ${process.env.ORACLE_DB_CONNECT_STRING}`));

    connection = await oracledb.getConnection({
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectString: process.env.ORACLE_DB_CONNECT_STRING,
    });

    console.log(chalk.green('✅ Connection established successfully.\n'));

    // 1. Health check
    console.log(chalk.blue('🔍 1. Database Health Check'));
    const countResult = await connection.execute('SELECT COUNT(*) AS CNT FROM customer');
    const customerCount = countResult.rows?.[0]?.[0] ?? 0;
    console.log(`   Total Customers: ${chalk.bold(customerCount.toLocaleString())}\n`);

    // 2. Accounts to verify
    const targetAccounts = [
      '1091880212895901',
      '1091880212630001',
      '1091880213324801',
      '1010120045573401',
      '1111400017504701',
      '1000500001826401',
    ];

    console.log(chalk.blue(`🔍 2. Verifying ${targetAccounts.length} accounts`));
    console.log(chalk.gray(`   ${targetAccounts.join(', ')}\n`));

    const summary: any[] = [];

    for (const account of targetAccounts) {
      console.log(chalk.yellow(`\n─── Account: ${account} ───`));

      const binds = { accountNumber: account.trim() };

      // Main query – incorporating mobile phone subquery
      const sql = `
        SELECT
          t1.CUST_ID                              AS "Customer ID",
          t1.CUST_NM                              AS "Customer Name",
          t2.ACCT_NO                              AS "Account Number",
          TO_CHAR(t2.OPENED_DT, 'YYYY-MM-DD')     AS "Opened Date",
          CASE 
            WHEN t1.REC_ST = 'A' THEN 'Active'
            WHEN t1.REC_ST = 'I' THEN 'Inactive'
            WHEN t1.REC_ST = 'L' THEN 'Closed'
            WHEN t1.REC_ST = 'D' THEN 'Dormant'
            WHEN t1.REC_ST = 'C' THEN 'Cancelled'
            ELSE NVL(t1.REC_ST, 'Unknown')
          END                                     AS "Status",
          (
            SELECT MAX(cm.CONTACT)
            FROM customer_contact_mode cm
            WHERE cm.cust_id = t1.cust_id
              AND cm.contact_mode_id = (
                SELECT contact_mode_id
                FROM contact_mode_ref cr
                WHERE cr.contact_mode_desc LIKE '%Mobile Phone%'
              )
          )                                       AS "Mobile Phone",
          t5.ADDR_LINE_1                          AS "Address Line 1"
        FROM customer t1
        LEFT JOIN DEPOSIT_ACCOUNT t2
          ON t2.PRIMARY_CUST_ID = t1.CUST_ID
          AND TRIM(t2.ACCT_NO) = TRIM(:accountNumber)
        LEFT JOIN CUSTOMER_ADDRESS_INFO t5
          ON t5.CUST_ID = t1.CUST_ID
        WHERE t2.ACCT_NO IS NOT NULL
      `;

      const result = await connection.execute(sql, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });

      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0];
        console.log(chalk.green('   ✅ Data found'));

        console.table([row]);

        summary.push({
          account,
          customer: row['Customer Name'],
          custId: row['Customer ID'],
          mobile: row['Mobile Phone'] || '—',
          status: row['Status'],
          opened: row['Opened Date'],
        });

        // Diagnostic if no mobile found
        if (!row['Mobile Phone']) {
          console.log(chalk.yellow('   ⚠️  No Mobile Phone found – quick check...'));

          const diagSql = `
            SELECT 
              CONTACT,
              CONTACT_MODE_ID,
              RANK_NO,
              REC_ST
            FROM customer_contact_mode
            WHERE cust_id = :custId
              AND CONTACT IS NOT NULL
            ORDER BY RANK_NO NULLS LAST
          `;

          try {
            const diagResult = await connection.execute(diagSql, { custId: row['Customer ID'] }, {
              outFormat: oracledb.OUT_FORMAT_OBJECT,
            });

            if (diagResult.rows?.length) {
              console.log(chalk.cyan(`   → Found ${diagResult.rows.length} contact record(s):`));
              console.table(diagResult.rows);
            } else {
              console.log(chalk.gray('   → No contact records found at all.'));
            }
          } catch (diagErr: any) {
            console.log(chalk.gray('   → Diagnostic skipped (possible table/column difference).'));
          }
        }
      } else {
        console.log(chalk.red('   ❌ No data found for this account'));
      }
    }

    // Final summary table
    console.log(chalk.blue('\n─── Verification Summary ───'));
    if (summary.length > 0) {
      console.table(summary);
    } else {
      console.log(chalk.gray('   No accounts matched.'));
    }

    console.log(chalk.green('\n🎯 Verification completed successfully.'));

  } catch (err: any) {
    console.error(chalk.red('\n❌ Execution failed:'));
    console.error(err.message || err);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log(chalk.cyan('🔌 Connection closed.'));
      } catch (closeErr: any) {
        console.error(chalk.red('Error closing connection:'), closeErr);
      }
    }
  }
}

// Execute
verifyOracleData();