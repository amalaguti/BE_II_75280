// Test script for JWT authentication
// Run with: node test-jwt.js

const BASE_URL = 'http://localhost:8080';

async function testAuth() {
  console.log('🧪 Testing JWT Authentication...\n');

  // Test 1: Register a new user
  console.log('1. Testing user registration...');
  try {
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        age: 25,
        password: 'password123'
      })
    });

    const registerData = await registerResponse.json();
    
    if (registerResponse.ok) {
      console.log('✅ Registration successful');
      console.log('Token:', registerData.token.substring(0, 20) + '...');
      console.log('User:', registerData.user);
      
      // Test 2: Get profile with token
      console.log('\n2. Testing profile access with token...');
      const profileResponse = await fetch(`${BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${registerData.token}`
        }
      });

      const profileData = await profileResponse.json();
      
      if (profileResponse.ok) {
        console.log('✅ Profile access successful');
        console.log('Profile:', profileData.user);
      } else {
        console.log('❌ Profile access failed:', profileData);
      }

      // Test 3: Login with existing user
      console.log('\n3. Testing login...');
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });

      const loginData = await loginResponse.json();
      
      if (loginResponse.ok) {
        console.log('✅ Login successful');
        console.log('Token:', loginData.token.substring(0, 20) + '...');
      } else {
        console.log('❌ Login failed:', loginData);
      }

    } else {
      console.log('❌ Registration failed:', registerData);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  // Test 4: Try to access profile without token
  console.log('\n4. Testing profile access without token...');
  try {
    const noTokenResponse = await fetch(`${BASE_URL}/api/auth/profile`);
    const noTokenData = await noTokenResponse.json();
    
    if (noTokenResponse.status === 401) {
      console.log('✅ Unauthorized access correctly blocked');
    } else {
      console.log('❌ Unauthorized access not blocked:', noTokenData);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n🏁 JWT Authentication tests completed!');
}

// Run the tests
testAuth(); 