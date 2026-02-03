const oracledb = require("oracledb");

const dbConfig = {
  user: "OMFILIVE",
  password: "OMFILIVE",
  connectString: "10.10.31.165:1521/OMOLIVE"
};

/**
 * Verifies if an account exists and returns contact info
 * @param {string} accountNumber 
 */
async function verifyCustomerFromCBS(accountNumber) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    
    // Using Bind Variables for security (Prevents SQL Injection)
    const sql = `
      SELECT ACCT_NM, MOBILE_NO 
      FROM DEPOSIT_ACCOUNT 
      WHERE ACCT_NO = :accNo
    `;
    
    const result = await connection.execute(sql, { accNo: accountNumber });

    if (result.rows.length > 0) {
      return {
        found: true,
        fullName: result.rows[0].ACCT_NM,
        phone: result.rows[0].MOBILE_NO // Use this for SMS
      };
    }
    return { found: false };
    
  } catch (err) {
    console.error("Oracle CBS Error:", err);
    throw err;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

module.exports = { verifyCustomerFromCBS };