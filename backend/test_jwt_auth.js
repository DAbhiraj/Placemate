#!/usr/bin/env node
/**
 * Quick test script to verify JWT authentication implementation
 * Run with: node test_jwt_auth.js
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:4000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.yellow}🧪 ${msg}${colors.reset}`),
};

// Store cookies
const cookies = new Map();

const setCookie = (name, value) => {
  cookies.set(name, value);
};

const getCookies = () => {
  const cookieHeader = Array.from(cookies.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
  return cookieHeader;
};

const extractCookies = (setCookieHeaders) => {
  if (!setCookieHeaders) return;
  const headers = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
  headers.forEach(header => {
    const parts = header.split(';')[0].split('=');
    if (parts.length === 2) {
      setCookie(parts[0], parts[1]);
    }
  });
};

async function testRegister() {
  log.test('Testing Registration');
  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'jwttest',
        email: `jwttest${Date.now()}@test.com`,
        password: 'TestPass123!',
        firstName: 'JWT',
        lastName: 'Test',
      }),
    });

    if (response.status === 200) {
      extractCookies(response.headers.get('set-cookie'));
      const data = await response.json();
      log.success(`Registered user: ${data.user.email}`);
      return data.user;
    } else {
      const error = await response.json();
      log.error(`Registration failed: ${error.message}`);
      return null;
    }
  } catch (err) {
    log.error(`Registration error: ${err.message}`);
    return null;
  }
}

async function testLogin() {
  log.test('Testing Login');
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'jwttest@test.com',
        password: 'TestPass123!',
      }),
    });

    if (response.status === 200) {
      extractCookies(response.headers.get('set-cookie'));
      const data = await response.json();
      log.success(`Logged in: ${data.user.email}`);
      return data.user;
    } else {
      const error = await response.json();
      log.error(`Login failed: ${error.message}`);
      return null;
    }
  } catch (err) {
    log.error(`Login error: ${err.message}`);
    return null;
  }
}

async function testMe() {
  log.test('Testing Get Current User (Me)');
  try {
    const response = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Cookie': getCookies(),
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      log.success(`Retrieved user: ${data.user.email}`);
      log.info(`Roles: ${data.user.roles.join(', ')}`);
      return data.user;
    } else {
      const error = await response.json();
      log.error(`Get user failed: ${error.message}`);
      return null;
    }
  } catch (err) {
    log.error(`Get user error: ${err.message}`);
    return null;
  }
}

async function testRefresh() {
  log.test('Testing Token Refresh');
  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Cookie': getCookies(),
      },
    });

    if (response.status === 200) {
      extractCookies(response.headers.get('set-cookie'));
      const data = await response.json();
      log.success(`Token refreshed for user: ${data.user.id}`);
      return true;
    } else {
      const error = await response.json();
      log.error(`Token refresh failed: ${error.message}`);
      return false;
    }
  } catch (err) {
    log.error(`Token refresh error: ${err.message}`);
    return false;
  }
}

async function testLogout() {
  log.test('Testing Logout');
  try {
    const response = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Cookie': getCookies(),
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      log.success(data.message);
      cookies.clear();
      return true;
    } else {
      const error = await response.json();
      log.error(`Logout failed: ${error.message}`);
      return false;
    }
  } catch (err) {
    log.error(`Logout error: ${err.message}`);
    return false;
  }
}

async function testUnauthorized() {
  log.test('Testing Unauthorized Access');
  try {
    const response = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Cookie': '', // No cookies
      },
    });

    if (response.status === 401) {
      log.success('Correctly returned 401 for unauthorized access');
      return true;
    } else {
      log.error(`Expected 401 but got ${response.status}`);
      return false;
    }
  } catch (err) {
    log.error(`Unauthorized test error: ${err.message}`);
    return false;
  }
}

async function runTests() {
  console.log('\n' + colors.blue + '=== JWT Authentication Test Suite ===' + colors.reset + '\n');
  
  log.info(`Testing against: ${BASE_URL}`);
  log.info('Make sure the backend server is running on port 5000\n');

  try {
    // Test 1: Register
    const user = await testRegister();
    if (!user) return;

    // Test 2: Me endpoint (should work after registration)
    await testMe();

    // Test 3: Refresh token
    await testRefresh();

    // Test 4: Me endpoint again (after refresh)
    await testMe();

    // Test 5: Logout
    await testLogout();

    // Test 6: Unauthorized (should fail)
    await testUnauthorized();

    console.log('\n' + colors.green + '=== All tests completed ===' + colors.reset + '\n');
  } catch (err) {
    log.error(`Test suite error: ${err.message}`);
  }
}

// Run tests
runTests().catch(console.error);
