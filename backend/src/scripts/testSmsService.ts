import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// Load environment variables from the backend's root .env file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function testSmsGateway() {
  // Dynamic import to ensure env vars are loaded first
  const { sendSmsSMPP: sendSms, initSmpp, checkSmsHealth } = await import('../services/smpp.service.js');

  console.log(chalk.cyan('🚀 Starting SMS Gateway Test...'));

  // --- Configuration ---
  // IMPORTANT: Replace with a real phone number you can check for the test message.
  const TEST_RECIPIENT = '+251913996975';
  const TEST_MESSAGE = 'This is a test message from the Omo Bank Fayda Harmonization system.';
  // ---------------------

  // Initialize the connection
  initSmpp();

  console.log(chalk.gray(`\n   Gateway Host: ${process.env.SMSC_HOST || process.env.SMPP_HOST || '10.204.181.70'}`));
  console.log(chalk.gray(`   System ID: ${process.env.SMPP_USERNAME || process.env.SMPP_SYSTEM_ID || '0156680'}`));
  console.log(chalk.gray(`   Sender ID: ${process.env.SMPP_SENDER_ADDRESS || process.env.SMPP_SENDER_ID || '6818'}`));
  console.log(chalk.gray(`   Recipient: ${TEST_RECIPIENT}\n`));

  console.log(chalk.yellow('⏳ Waiting for SMPP connection to be established...'));

  // Wait for connection (max 10 seconds)
  let attempts = 0;
  while (!checkSmsHealth() && attempts < 20) {
    await new Promise(resolve => setTimeout(resolve, 500));
    attempts++;
  }

  if (!checkSmsHealth()) {
    console.error(chalk.red('❌ Failed to connect to SMPP server within timeout.'));
    process.exit(1);
  }

  try {
    const msgId = await sendSms(TEST_RECIPIENT, TEST_MESSAGE);
    console.log(chalk.green('✅ SMS Gateway Test Successful!'));
    console.log(chalk.green(`   Message ID: ${msgId}`));
    console.log(chalk.green('   The request was sent to the gateway. Check the gateway logs or the recipient\'s phone for confirmation.'));
    process.exit(0);
  } catch (error: any) {
    console.error(chalk.red('❌ SMS Gateway Test Failed.'));
    console.error(chalk.red(`   Error: ${error.message}`));
    console.log(chalk.yellow('\n   Troubleshooting Steps:'));
    console.log(chalk.yellow('   1. Verify the IP address (10.204.181.70) and port (5019) are correct in your .env file.'));
    console.log(chalk.yellow('   2. Ensure your machine has a network route to the gateway (check VPN, firewall rules).'));
    console.log(chalk.yellow('   3. Confirm the API Key in your .env file is correct (if required by the gateway).'));
    process.exit(1);
  }
}

testSmsGateway();