import oracledb from 'oracledb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from the root .env file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function testConnection() {
  let connection;

  console.log('🔌 Testing Oracle Database Connection...');
  console.log(`   User: ${process.env.ORACLE_USER}`);
  console.log(`   Connect String: ${process.env.ORACLE_CONNECT_STRING}`);

  try {
    // Attempt connection
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING,
    });

    console.log('✅ Connection established successfully!');

    // Run a simple test query
    const result = await connection.execute('SELECT 1 AS TEST FROM DUAL');
    console.log('   Test Query Result:', result.rows);

  } catch (err) {
    console.error('❌ Connection failed:', err);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('🔌 Connection closed.');
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

testConnection();