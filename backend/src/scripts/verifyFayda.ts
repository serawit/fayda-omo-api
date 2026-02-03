import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from the root .env file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const FAYDA_BASE_URL = process.env.FAYDA_BASE_URL;

async function verifyFaydaConnection() {
  console.log('Attempting to verify connection to Fayda...');

  if (!FAYDA_BASE_URL) {
    console.error('❌ Error: FAYDA_BASE_URL is not defined in your .env file.');
    process.exit(1);
  }

  const oidcConfigUrl = `${FAYDA_BASE_URL}/.well-known/openid-configuration`;
  console.log(`Connecting to: ${oidcConfigUrl}`);

  try {
    const { status, data } = await axios.get(oidcConfigUrl);

    if (status === 200 && data.issuer) {
      console.log('\n✅ Success! Connection to Fayda established.');
      console.log(`   Issuer found: ${data.issuer}`);
      console.log('   Your FAYDA_BASE_URL is correct.');
    } else {
      console.warn('\n⚠️ Warning: Connection successful, but the response is not a valid OIDC configuration.');
      console.warn('   Status:', status);
    }
  } catch (error) {
    console.error('\n❌ Error: Failed to connect to Fayda.');
    if (axios.isAxiosError(error)) {
      console.error(`   This could be due to a network issue, firewall, or an incorrect FAYDA_BASE_URL.`);
      console.error(`   Details: ${error.message}`);
    }
    process.exit(1);
  }
}

verifyFaydaConnection();