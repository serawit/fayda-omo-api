import oracledb from 'oracledb';

// OracleDB 6.0+ defaults to "Thin" mode (pure JS), which is great for Node.js
// It doesn't require the heavy Oracle Instant Client binaries for standard connections.

export async function initializeOracle() {
  try {
    if (!process.env.ORACLE_DB_USER || !process.env.ORACLE_DB_CONNECT_STRING) {
      console.warn('⚠️ Oracle DB credentials missing in .env. Skipping connection.');
      return;
    }

    // Create a connection pool (best practice for APIs)
    await oracledb.createPool({
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectString: process.env.ORACLE_DB_CONNECT_STRING,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1,
    });

    console.log('✅ Oracle DB Connection Pool initialized');
  } catch (err) {
    console.error('❌ Failed to connect to Oracle DB:', err);
    // We re-throw so server.ts knows initialization failed
    throw err;
  }
}

export async function closeOracle() {
  await oracledb.getPool().close(10);
}