import { lookupCoreBankingCustomer } from '../services/coreBanking.service.js';

async function testMock() {
  console.log('🏦 Testing Core Banking Mock Lookup...');

  // Test Case 1: Valid Account
  const validAccount = '100012345678';
  console.log(`\n🔍 Looking up valid account: ${validAccount}`);
  const result1 = await lookupCoreBankingCustomer(validAccount);
  console.log('   Result:', result1);

  // Test Case 2: Invalid Account
  const invalidAccount = '999999999999';
  console.log(`\n🔍 Looking up invalid account: ${invalidAccount}`);
  const result2 = await lookupCoreBankingCustomer(invalidAccount);
  console.log('   Result:', result2); // Should be null

  console.log('\n✅ Mock test completed.');
}

testMock();