const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(body);
        } catch {
          parsed = body;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed,
        });
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING PROJECTSETU CITIZEN AUTH E2E TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const testMobile = `987${randomSuffix}9`;
  const fullMobile = `+91${testMobile}`;
  const testPassword = 'CitizenPassword@2026';
  const testName = 'Aarav Sharma';

  // 1. Health check
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET',
    });
    assert(res.status === 200, `Health check returned 200 (status=${res.status})`);
  } catch (err) {
    assert(false, `Health check failed: ${err.message}`);
  }

  // 2. Weak password rejection
  try {
    const res = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register/citizen',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        fullName: testName,
        mobileNumber: testMobile,
        password: 'weak',
      }
    );
    assert(
      res.status === 400 && res.data.message.includes('Password must'),
      `Weak password rejected with 400: "${res.data.message}"`
    );
  } catch (err) {
    assert(false, `Weak password test failed: ${err.message}`);
  }

  // 3. Invalid Indian mobile number rejection
  try {
    const res = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register/citizen',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        fullName: testName,
        mobileNumber: '12345',
        password: testPassword,
      }
    );
    assert(
      res.status === 400 && res.data.message.includes('valid 10-digit Indian mobile'),
      `Invalid mobile rejected with 400: "${res.data.message}"`
    );
  } catch (err) {
    assert(false, `Invalid mobile test failed: ${err.message}`);
  }

  // 4. Valid Citizen Registration
  let registrationResponse;
  try {
    const res = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register/citizen',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        fullName: testName,
        mobileNumber: testMobile,
        password: testPassword,
      }
    );
    registrationResponse = res.data;
    assert(
      res.status === 201 && res.data.success === true,
      `Citizen registered with 201: ${JSON.stringify(res.data.message)}`
    );
    assert(
      res.data.isMock === true && res.data.mockOtp === '123456',
      `Mock mode active and OTP is ${res.data.mockOtp}`
    );
    assert(
      res.data.mobileNumber === fullMobile,
      `Mobile normalized to ${res.data.mobileNumber}`
    );
  } catch (err) {
    assert(false, `Registration failed: ${err.message}`);
  }

  // 5. Cooldown enforcement on immediate resend
  try {
    const res = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/resend-mobile-otp',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { mobileNumber: fullMobile }
    );
    assert(
      res.status === 400 && res.data.message.includes('Please wait'),
      `Resend OTP cooldown enforced: "${res.data.message}"`
    );
  } catch (err) {
    assert(false, `Cooldown test failed: ${err.message}`);
  }

  // 6. Invalid OTP code rejection
  try {
    const res = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/verify-mobile-otp',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        mobileNumber: fullMobile,
        otp: '000000',
      }
    );
    assert(
      res.status === 400 && res.data.message.includes('Invalid OTP'),
      `Invalid OTP rejected with attempt count: "${res.data.message}"`
    );
  } catch (err) {
    assert(false, `Invalid OTP test failed: ${err.message}`);
  }

  // 7. Successful OTP verification with Mock OTP (123456)
  let citizenToken;
  let citizenUser;
  try {
    const res = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/verify-mobile-otp',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        mobileNumber: fullMobile,
        otp: '123456',
      }
    );
    assert(
      res.status === 200 && res.data.success === true,
      `OTP verified successfully with 200: "${res.data.message}"`
    );
    citizenToken = res.data.token;
    citizenUser = res.data.user;
    assert(!!citizenToken, `Received valid JWT token: ${citizenToken?.slice(0, 20)}...`);
    assert(
      citizenUser && citizenUser.role === 'CITIZEN' && citizenUser.mobileVerified === true,
      `User activated with CITIZEN role, mobileVerified=true, accountStatus=${citizenUser?.accountStatus}`
    );
  } catch (err) {
    assert(false, `OTP verification failed: ${err.message}`);
  }

  // 8. Access Citizen Profile via GET /api/auth/me
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    assert(
      res.status === 200 && res.data.data.name === testName,
      `Citizen accessed /api/auth/me: Welcome ${res.data.data?.name} (${res.data.data?.role})`
    );
  } catch (err) {
    assert(false, `Profile check failed: ${err.message}`);
  }

  // 9. Role-based security check: Citizen cannot access /api/users (Admin only)
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/users',
      method: 'GET',
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    assert(
      res.status === 403,
      `Security gate working: Citizen blocked from /api/users with 403 Forbidden`
    );
  } catch (err) {
    assert(false, `Security test failed: ${err.message}`);
  }

  // 10. Citizen can access projects
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/projects',
      method: 'GET',
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    assert(
      res.status === 200 && Array.isArray(res.data.data),
      `Citizen accessed /api/projects: returned ${res.data.data?.length} projects`
    );
  } catch (err) {
    assert(false, `Projects test failed: ${err.message}`);
  }

  // 11. Unified Login with Mobile Number + Password (+91 format)
  try {
    const res = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        identifier: fullMobile,
        password: testPassword,
      }
    );
    assert(
      res.status === 200 && res.data.data?.token,
      `Unified login with +91 format succeeded: user=${res.data.data?.user?.name}`
    );
  } catch (err) {
    assert(false, `Mobile login test failed: ${err.message}`);
  }

  // 12. Unified Login with 10-digit raw Mobile Number (9876543299)
  try {
    const res = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        identifier: testMobile,
        password: testPassword,
      }
    );
    assert(
      res.status === 200 && res.data.data?.token,
      `Unified login with 10-digit raw mobile succeeded: user=${res.data.data?.user?.name}`
    );
  } catch (err) {
    assert(false, `Raw mobile login test failed: ${err.message}`);
  }

  // 13. Existing Super Admin login check (admin@projectsetu.gov.in)
  try {
    const res = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        identifier: 'admin@projectsetu.gov.in',
        password: 'Admin@123',
      }
    );
    assert(
      res.status === 200 && res.data.data?.user?.role === 'SUPER_ADMIN',
      `Super Admin login working properly: ${res.data.data?.user?.email} (${res.data.data?.user?.role})`
    );

    const adminToken = res.data.data?.token;
    const usersRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/users',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      usersRes.status === 200 && Array.isArray(usersRes.data.data),
      `Super Admin can access /api/users: returned ${usersRes.data.data?.length} users`
    );
  } catch (err) {
    assert(false, `Admin login test failed: ${err.message}`);
  }

  console.log('\n======================================================');
  console.log(`🏁 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
