import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'aX7$kP9mW#vL2qR8tY4nJ6bF0cH3zQ5xM1pD9eU2gA8rT6yB4iO0wS!vN@jK';
const BASE_URL = 'http://localhost:5000/api/harmonization';

const runTest = async () => {
  console.log('🧪 Starting API Test: Validate FAN');

  // 1. Create a valid JWT token (simulating a logged-in user)
  // This matches the payload structure expected by your auth middleware
  const token = jwt.sign(
    { 
      userId: 'test_user_123', 
      accountNumber: '10001' 
    }, 
    JWT_SECRET, 
    { expiresIn: '1h' }
  );

  console.log('🔑 Generated Test Token');

  // 2. Define test cases
  const testCases = [
    { name: 'Valid FAN (16 digits)', fan: '1234567890123456', expectedStatus: 200 },
    { name: 'Invalid Length (Short)', fan: '12345', expectedStatus: 400 },
    { name: 'Not Found (Mock Logic)', fan: '0000000000000000', expectedStatus: 404 },
  ];

  // 3. Run tests
  for (const test of testCases) {
    console.log(`\n👉 Testing: ${test.name}`);
    
    try {
      const response = await fetch(`${BASE_URL}/validate-fan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fan: test.fan })
      });

      const data = await response.json();
      
      const statusIcon = response.status === test.expectedStatus ? '✅' : '❌';
      console.log(`   ${statusIcon} Status: ${response.status} (Expected: ${test.expectedStatus})`);
      console.log(`   📄 Response:`, data);

    } catch (error) {
      console.error('   ❌ Request Failed (Is the server running?):', error);
    }
  }
};

runTest();