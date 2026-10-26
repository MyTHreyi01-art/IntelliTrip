import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/v1/auth', authRoutes);
app.use(notFound);
app.use(errorHandler);

async function runStandaloneTest() {
  console.log('Connecting to MongoDB...');
  await connectDB();

  const server = app.listen(5088, async () => {
    console.log('Test Server listening on port 5088');
    const API_URL = 'http://127.0.0.1:5088/api/v1';

    const timestamp = Date.now();
    const touristEmail = `tourist_${timestamp}@example.com`;
    const adminEmail = `admin_${timestamp}@example.com`;
    const password = 'SecretPassword123!';

    try {
      // 1. Register Tourist
      console.log('1. Registering Tourist...');
      const r1 = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Tourist Test', email: touristEmail, password, role: 'Tourist' })
      });
      const d1 = await r1.json();
      if (!r1.ok) throw new Error(`Tourist registration failed: ${JSON.stringify(d1)}`);
      console.log('   ✅ Tourist Registered:', d1.data._id, 'Role:', d1.data.role);

      // 2. Register Admin
      console.log('2. Registering Admin...');
      const r2 = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Admin Test', email: adminEmail, password, role: 'Super Admin' })
      });
      const d2 = await r2.json();
      if (!r2.ok) throw new Error(`Admin registration failed: ${JSON.stringify(d2)}`);
      console.log('   ✅ Admin Registered:', d2.data._id, 'Role:', d2.data.role);

      // 3. Login Tourist
      console.log('3. Logging in Tourist...');
      const r3 = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: touristEmail, password })
      });
      const d3 = await r3.json();
      if (!r3.ok) throw new Error(`Tourist login failed: ${JSON.stringify(d3)}`);
      const touristToken = d3.data.token;
      console.log('   ✅ Tourist Logged in! JWT acquired.');

      // 4. Login Admin
      console.log('4. Logging in Admin...');
      const r4 = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password })
      });
      const d4 = await r4.json();
      if (!r4.ok) throw new Error(`Admin login failed: ${JSON.stringify(d4)}`);
      const adminToken = d4.data.token;
      console.log('   ✅ Admin Logged in! JWT acquired.');

      // 5. Invalid Login (Wrong Password)
      console.log('5. Testing Invalid Login (Wrong Password)...');
      const r5 = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: touristEmail, password: 'WrongPassword!' })
      });
      const d5 = await r5.json();
      if (r5.status === 401) {
        console.log(`   ✅ Invalid Login Rejected Correctly! Status: 401 (${d5.message})`);
      } else {
        throw new Error(`Expected status 401 on invalid login, got ${r5.status}`);
      }

      // 6. Protected Route GET /auth/me with Tourist Token
      console.log('6. Testing Protected Route GET /auth/me with Tourist Token...');
      const r6 = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${touristToken}` }
      });
      const d6 = await r6.json();
      if (!r6.ok) throw new Error(`Protected route failed: ${JSON.stringify(d6)}`);
      console.log('   ✅ Profile fetched successfully for:', d6.data.name, 'Role:', d6.data.role);

      // 7. Admin Access to Admin Endpoint
      console.log('7. Testing Admin Access to Admin-Only Endpoint...');
      const r7 = await fetch(`${API_URL}/auth/admin-only`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const d7 = await r7.json();
      if (!r7.ok) throw new Error(`Admin endpoint failed: ${JSON.stringify(d7)}`);
      console.log('   ✅ Admin Access Authorized! Message:', d7.message);

      // 8. Unauthorized Role Access (Tourist accessing Admin endpoint)
      console.log('8. Testing Unauthorized Role Access (Tourist -> Admin Endpoint)...');
      const r8 = await fetch(`${API_URL}/auth/admin-only`, {
        headers: { Authorization: `Bearer ${touristToken}` }
      });
      const d8 = await r8.json();
      if (r8.status === 403) {
        console.log(`   ✅ Unauthorized Role Access Blocked Correctly! Status: 403 (${d8.message})`);
      } else {
        throw new Error(`Expected status 403 on unauthorized access, got ${r8.status}`);
      }

      console.log('\n====================================================');
      console.log('   🎉 ALL 8 PHASE 1 AUTHENTICATION TESTS PASSED!    ');
      console.log('====================================================');
    } catch (err) {
      console.error('❌ Test failed:', err.message);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runStandaloneTest();
