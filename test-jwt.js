// Test script for JWT authentication with cookies
// Run with: node test-jwt.js

const BASE_URL = 'http://localhost:8080';

async function testAuth() {
  console.log('🧪 Testing JWT Authentication with Cookies...\n');

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
      console.log('User:', registerData.user);
      console.log('Cookies set:', registerResponse.headers.get('set-cookie') ? 'Yes' : 'No');
      
      // Test 2: Get profile with cookies
      console.log('\n2. Testing profile access with cookies...');
      const profileResponse = await fetch(`${BASE_URL}/api/auth/profile`, {
        credentials: 'include' // Include cookies
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
        }),
        credentials: 'include'
      });

      const loginData = await loginResponse.json();
      
      if (loginResponse.ok) {
        console.log('✅ Login successful');
        console.log('User:', loginData.user);
        console.log('Cookies set:', loginResponse.headers.get('set-cookie') ? 'Yes' : 'No');
      } else {
        console.log('❌ Login failed:', loginData);
      }

    } else {
      console.log('❌ Registration failed:', registerData);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  // Test 4: Try to access profile without cookies
  console.log('\n4. Testing profile access without cookies...');
  try {
    const noCookieResponse = await fetch(`${BASE_URL}/api/auth/profile`);
    const noCookieData = await noCookieResponse.json();
    
    if (noCookieResponse.status === 401) {
      console.log('✅ Unauthorized access correctly blocked');
    } else {
      console.log('❌ Unauthorized access not blocked:', noCookieData);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n🏁 JWT Authentication with Cookies tests completed!');
}

// Run the tests
testAuth(); 