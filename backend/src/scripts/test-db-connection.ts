import oracledb from 'oracledb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function testConnection() {
  console.log('----------------------------------------');
  console.log('🛠️  Oracle Database Connectivity Test');
  console.log('----------------------------------------');
  console.log(`Target Host:   ${process.env.ORACLE_CONNECT_STRING}`);
  console.log(`User:          ${process.env.ORACLE_USER}`);
  console.log('Connecting...');

  let connection;
  try {
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING,
      transportConnectTimeout: 10000 // 10 seconds timeout for test
    });

    console.log('✅ SUCCESS: Connection established!');
    const result = await connection.execute('SELECT 1 FROM DUAL');
    console.log('✅ Query Test:  Passed (SELECT 1 FROM DUAL)');
  } catch (err: any) {
    console.error('❌ FAILED: Could not connect.');
    console.error(`   Error Code: ${err.code}`);
    console.error(`   Message:    ${err.message}`);
  } finally {
    if (connection) {
      await connection.close();
    }
    console.log('----------------------------------------');
  }
}

testConnection();