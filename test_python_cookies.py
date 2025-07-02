#!/usr/bin/env python3
"""
Test script to demonstrate httpOnly cookies with Python requests
"""

import requests
import json

BASE_URL = 'http://localhost:8080'

def test_httponly_cookies():
    print("🧪 Testing httpOnly Cookies with Python Requests\n")
    
    # Create a session to handle cookies
    session = requests.Session()
    
    print("1. Testing registration...")
    try:
        register_response = session.post(f'{BASE_URL}/api/auth/register', json={
            'first_name': 'Python',
            'last_name': 'Test',
            'email': 'python@test.com',
            'age': 25,
            'password': 'password123'
        })
        
        if register_response.status_code == 201:
            print("✅ Registration successful")
            print(f"Response: {register_response.json()}")
            
            # Check what cookies we can see
            print(f"\n📋 Cookies in session:")
            for cookie in session.cookies:
                print(f"  - {cookie.name}: {cookie.value[:20]}...")
            
            # Try to access the httpOnly cookie directly
            print(f"\n🔍 Can we see httpOnly cookies?")
            cookies_dict = session.cookies.get_dict()
            print(f"  All cookies: {cookies_dict}")
            
            if 'jwt_token' in cookies_dict:
                print("❌ httpOnly cookie is visible (this shouldn't happen)")
            else:
                print("✅ httpOnly cookie is properly hidden!")
            
        else:
            print(f"❌ Registration failed: {register_response.status_code}")
            print(f"Response: {register_response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "="*50)
    
    print("2. Testing login...")
    try:
        login_response = session.post(f'{BASE_URL}/api/auth/login', json={
            'email': 'python@test.com',
            'password': 'password123'
        })
        
        if login_response.status_code == 200:
            print("✅ Login successful")
            print(f"Response: {login_response.json()}")
            
            # Check cookies again
            print(f"\n📋 Cookies after login:")
            for cookie in session.cookies:
                print(f"  - {cookie.name}: {cookie.value[:20]}...")
                
        else:
            print(f"❌ Login failed: {login_response.status_code}")
            print(f"Response: {login_response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "="*50)
    
    print("3. Testing authenticated request...")
    try:
        profile_response = session.get(f'{BASE_URL}/api/auth/profile')
        
        if profile_response.status_code == 200:
            print("✅ Profile access successful")
            print(f"Response: {profile_response.json()}")
            print("✅ httpOnly cookie was automatically sent!")
            
        elif profile_response.status_code == 401:
            print("❌ Unauthorized - cookie not sent or invalid")
            
        else:
            print(f"❌ Unexpected status: {profile_response.status_code}")
            print(f"Response: {profile_response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "="*50)
    
    print("4. Testing logout...")
    try:
        logout_response = session.post(f'{BASE_URL}/api/auth/logout')
        
        if logout_response.status_code == 200:
            print("✅ Logout successful")
            print(f"Response: {logout_response.json()}")
            
            # Check if cookie was cleared
            print(f"\n📋 Cookies after logout:")
            for cookie in session.cookies:
                print(f"  - {cookie.name}: {cookie.value[:20]}...")
                
            if not session.cookies:
                print("✅ All cookies cleared!")
            else:
                print("⚠️ Some cookies still present")
                
        else:
            print(f"❌ Logout failed: {logout_response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "="*50)
    
    print("5. Testing access after logout...")
    try:
        profile_response = session.get(f'{BASE_URL}/api/auth/profile')
        
        if profile_response.status_code == 401:
            print("✅ Correctly blocked after logout")
        else:
            print(f"❌ Unexpected access: {profile_response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def test_manual_cookie_manipulation():
    print("\n" + "="*50)
    print("🔧 Testing Manual Cookie Manipulation")
    print("="*50)
    
    session = requests.Session()
    
    print("1. Trying to manually set httpOnly cookie...")
    try:
        # This won't actually set an httpOnly cookie
        session.cookies.set('jwt_token', 'fake_token', domain='localhost')
        print("⚠️ Cookie set, but it's NOT httpOnly (only server can set httpOnly)")
        
    except Exception as e:
        print(f"❌ Error setting cookie: {e}")
    
    print("\n2. Testing access with fake cookie...")
    try:
        profile_response = session.get(f'{BASE_URL}/api/auth/profile')
        
        if profile_response.status_code == 401:
            print("✅ Correctly rejected fake token")
        else:
            print(f"❌ Unexpected access: {profile_response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🚀 Starting Python httpOnly Cookie Tests")
    print("Make sure your server is running on http://localhost:8080")
    print("="*50)
    
    test_httponly_cookies()
    test_manual_cookie_manipulation()
    
    print("\n🏁 Tests completed!")
    print("\n💡 Key Points:")
    print("  - httpOnly cookies are set by the SERVER")
    print("  - Python requests can SEND httpOnly cookies")
    print("  - Python requests cannot READ httpOnly cookies")
    print("  - This is the same behavior as JavaScript in browsers") 