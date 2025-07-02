#!/usr/bin/env node

/**
 * Test script for age validation
 */

const BASE_URL = 'http://localhost:8080';

async function testAgeValidation() {
  console.log('🧪 Testing Age Validation...\n');

  const testCases = [
    {
      name: 'Valid age (25)',
      age: 25,
      expectedSuccess: true
    },
    {
      name: 'Minimum age (18)',
      age: 18,
      expectedSuccess: true
    },
    {
      name: 'Maximum age (120)',
      age: 120,
      expectedSuccess: true
    },
    {
      name: 'Age too low (17)',
      age: 17,
      expectedSuccess: false,
      expectedError: 'La edad debe estar entre 18 y 120 años'
    },
    {
      name: 'Age too high (121)',
      age: 121,
      expectedSuccess: false,
      expectedError: 'La edad debe estar entre 18 y 120 años'
    },
    {
      name: 'Invalid age (0)',
      age: 0,
      expectedSuccess: false,
      expectedError: 'La edad debe estar entre 18 y 120 años'
    },
    {
      name: 'Negative age (-5)',
      age: -5,
      expectedSuccess: false,
      expectedError: 'La edad debe estar entre 18 y 120 años'
    }
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`${i + 1}. Testing: ${testCase.name}`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: `Test${i}`,
          last_name: 'User',
          email: `test${i}@example.com`,
          age: testCase.age,
          password: 'password123'
        })
      });

      const data = await response.json();
      
      if (testCase.expectedSuccess) {
        if (response.ok) {
          console.log(`   ✅ PASS: Registration successful`);
        } else {
          console.log(`   ❌ FAIL: Expected success but got error: ${data.error}`);
        }
      } else {
        if (!response.ok && data.error.includes(testCase.expectedError)) {
          console.log(`   ✅ PASS: Correctly rejected with error: ${data.error}`);
        } else {
          console.log(`   ❌ FAIL: Expected error "${testCase.expectedError}" but got: ${data.error || 'success'}`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
    
    console.log('');
  }

  console.log('🏁 Age validation tests completed!');
}

// Run the tests
testAgeValidation(); 