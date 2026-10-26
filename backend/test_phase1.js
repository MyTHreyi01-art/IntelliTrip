const API_URL = 'http://127.0.0.1:5000/api/v1';

async function runPhase1Tests() {
  console.log('====================================================');
  console.log('       INTELLITRIP PHASE 1 AUTOMATED VERIFICATION   ');
  console.log('====================================================\n');

  const timestamp = Date.now();
  const touristEmail = `tourist_${timestamp}@intellitrip.test`;
  const adminEmail = `admin_${timestamp}@intellitrip.test`;
  const password = 'SecretPassword123!';

  let touristToken = '';
  let adminToken = '';

  try {
    // TEST 1: Register Tourist
    console.log('1. Testing Tourist Registration...');
    const touristRegRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Tourist',
        email: touristEmail,
        password: password,
        role: 'Tourist',
        phone: '+1555123456'
      })
    });
    const touristRegData = await touristRegRes.json();
    if (!touristRegRes.ok) throw new Error(`Tourist registration failed: ${JSON.stringify(touristRegData)}`);
    console.log('   ✅ Tourist Registration Successful!');
    console.log(`   User ID: ${touristRegData.data._id}, Role: ${touristRegData.data.role}\n`);

    // TEST 2: Register Admin
    console.log('2. Testing Admin Registration...');
    const adminRegRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Super Admin',
        email: adminEmail,
        password: password,
        role: 'Super Admin',
        phone: '+1555987654'
      })
    });
    const adminRegData = await adminRegRes.json();
    if (!adminRegRes.ok) throw new Error(`Admin registration failed: ${JSON.stringify(adminRegData)}`);
    console.log('   ✅ Admin Registration Successful!');
    console.log(`   User ID: ${adminRegData.data._id}, Role: ${adminRegData.data.role}\n`);

    // TEST 3: Login Tourist
    console.log('3. Testing Tourist Login...');
    const touristLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: touristEmail,
        password: password
      })
    });
    const touristLoginData = await touristLoginRes.json();
    if (!touristLoginRes.ok) throw new Error(`Tourist login failed: ${JSON.stringify(touristLoginData)}`);
    touristToken = touristLoginData.data.token;
    console.log('   ✅ Tourist Login Successful!');
    console.log(`   JWT Token acquired (Length: ${touristToken.length})\n`);

    // TEST 4: Login Admin
    console.log('4. Testing Admin Login...');
    const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: adminEmail,
        password: password
      })
    });
    const adminLoginData = await adminLoginRes.json();
    if (!adminLoginRes.ok) throw new Error(`Admin login failed: ${JSON.stringify(adminLoginData)}`);
    adminToken = adminLoginData.data.token;
    console.log('   ✅ Admin Login Successful!');
    console.log(`   JWT Token acquired (Length: ${adminToken.length})\n`);

    // TEST 5: Invalid Login (Wrong Password)
    console.log('5. Testing Invalid Login (Wrong Password)...');
    const invalidLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: touristEmail,
        password: 'WrongPassword999'
      })
    });
    const invalidLoginData = await invalidLoginRes.json();
    if (invalidLoginRes.status === 401) {
      console.log(`   ✅ Invalid Login Rejected Correctly! Status: 401 (${invalidLoginData.message})\n`);
    } else {
      throw new Error(`Expected HTTP 401 on invalid login, got ${invalidLoginRes.status}`);
    }

    // TEST 6: Protected Route (GET /auth/me) with Tourist Token
    console.log('6. Testing Protected Route GET /auth/me with Tourist Token...');
    const meRes = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${touristToken}`,
        'Content-Type': 'application/json'
      }
    });
    const meData = await meRes.json();
    if (!meRes.ok) throw new Error(`Protected route failed: ${JSON.stringify(meData)}`);
    console.log('   ✅ Protected Profile Route Accessed Successfully!');
    console.log(`   Name: ${meData.data.name}, Role: ${meData.data.role}\n`);

    // TEST 7: Admin Access to Admin Endpoint
    console.log('7. Testing Admin Access to Admin-Only Endpoint...');
    const adminAccessRes = await fetch(`${API_URL}/auth/admin-only`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    const adminAccessData = await adminAccessRes.json();
    if (!adminAccessRes.ok) throw new Error(`Admin endpoint failed: ${JSON.stringify(adminAccessData)}`);
    console.log('   ✅ Admin Access Granted Successfully!');
    console.log(`   Response Message: "${adminAccessData.message}"\n`);

    // TEST 8: Unauthorized Role Access (Tourist attempting Admin endpoint)
    console.log('8. Testing Unauthorized Access (Tourist accessing Admin Endpoint)...');
    const unauthRes = await fetch(`${API_URL}/auth/admin-only`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${touristToken}`,
        'Content-Type': 'application/json'
      }
    });
    const unauthData = await unauthRes.json();
    if (unauthRes.status === 403) {
      console.log(`   ✅ Unauthorized Access Blocked Correctly! Status: 403 (${unauthData.message})\n`);
    } else {
      throw new Error(`Expected HTTP 403 on unauthorized access, got ${unauthRes.status}`);
    }

    console.log('====================================================');
    console.log('   🎉 ALL PHASE 1 AUTHENTICATION TESTS PASSED!       ');
    console.log('====================================================');
  } catch (error) {
    console.error('\n❌ Test Suite Failed:', error.message);
    process.exit(1);
  }
}

runPhase1Tests();
