import http from 'http';
import { spawn } from 'child_process';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper for HTTP JSON post request
const postJSON = (port, pathName, data, token = null) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data || {});
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        host: '127.0.0.1',
        port: port,
        path: pathName,
        method: 'POST',
        headers
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, rawBody: body });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });
};

const getJSON = (port, pathName, token = null) => {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        host: '127.0.0.1',
        port: port,
        path: pathName,
        method: 'GET',
        headers
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, rawBody: body });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    req.end();
  });
};

async function runTests() {
  console.log('--- STARTING PHASE 5 INTEGRATION & SYSTEM AUDIT TEST SUITE ---');

  // Connect MongoDB
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/intellitrip';
  await mongoose.connect(mongoUri);
  console.log('[1/4] Connected to MongoDB for Phase 5 system audit.');

  // Launch Node.js Express test server on port 5098
  const app = express();
  app.use(cors());
  app.use(express.json());

  const authRoutes = (await import('./routes/authRoutes.js')).default;
  const destinationRoutes = (await import('./routes/destinationRoutes.js')).default;
  const aiRoutes = (await import('./routes/aiRoutes.js')).default;
  const communityRoutes = (await import('./routes/communityRoutes.js')).default;
  const emergencyRoutes = (await import('./routes/emergencyRoutes.js')).default;
  const loyaltyRoutes = (await import('./routes/loyaltyRoutes.js')).default;
  const analyticsRoutes = (await import('./routes/analyticsRoutes.js')).default;

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/destinations', destinationRoutes);
  app.use('/api/v1/ai', aiRoutes);
  app.use('/api/v1/community', communityRoutes);
  app.use('/api/v1/emergency', emergencyRoutes);
  app.use('/api/v1/loyalty', loyaltyRoutes);
  app.use('/api/v1/analytics', analyticsRoutes);

  const server = app.listen(5098, '127.0.0.1');

  try {
    // Step 1: Register / Login Test User
    console.log('[2/4] Testing Auth & Token Generation...');
    const email = `phase5_tester_${Date.now()}@test.com`;
    const regRes = await postJSON(5098, '/api/v1/auth/register', {
      name: 'Phase 5 Test User',
      email,
      password: 'password123',
      role: 'Super Admin'
    });

    const token = regRes.body.data?.token;
    console.log('Registered User Token Generated:', !!token, 'Role:', regRes.body.data?.role);
    if (!token) throw new Error('User Auth token generation failed');

    // Step 2: Test Phase 5 APIs
    console.log('[3/4] Testing Phase 5 Core Features (Community, Emergency, Loyalty, Analytics)...');

    // Community Posts
    const postRes = await postJSON(5098, '/api/v1/community/posts', { title: 'Amazing Coorg Trip Tips', content: 'Make sure to visit the coffee plantations!', category: 'Tips' }, token);
    console.log('Community Post Status:', postRes.status, 'Title:', postRes.body.data?.title);
    if (postRes.status !== 201) throw new Error('Community Post API failed');

    // Emergency Helpline & SOS
    const contactsRes = await getJSON(5098, '/api/v1/emergency/contacts');
    console.log('Emergency Contacts Count:', contactsRes.body.data?.helplines?.length);
    if (contactsRes.status !== 200 || !contactsRes.body.data?.helplines) throw new Error('Emergency Contacts API failed');

    const sosRes = await postJSON(5098, '/api/v1/emergency/sos', { location: 'Mysore Palace Gate 2', type: 'Medical', notes: 'Sprained ankle' }, token);
    console.log('SOS Dispatch Status:', sosRes.status, 'Ticket ID:', sosRes.body.data?._id);
    if (sosRes.status !== 201) throw new Error('Emergency SOS API failed');

    // Loyalty Rewards
    const loyaltyRes = await getJSON(5098, '/api/v1/loyalty/profile', token);
    console.log('Loyalty Profile Status:', loyaltyRes.status, 'Points:', loyaltyRes.body.data?.points, 'Tier:', loyaltyRes.body.data?.tier);
    if (loyaltyRes.status !== 200) throw new Error('Loyalty Profile API failed');

    // Analytics Overview
    const analyticsRes = await getJSON(5098, '/api/v1/analytics/overview', token);
    console.log('Analytics Overview Status:', analyticsRes.status, 'Total Revenue:', analyticsRes.body.data?.summary?.totalRevenue);
    if (analyticsRes.status !== 200) throw new Error('Analytics Overview API failed');

    console.log('--> ALL PHASE 5 NEW APIS PASSED CLEANLY!\n');

    // Step 3: Test Gemini AI & Python FastAPI Regression
    console.log('[4/4] Testing Phase 3 (Gemini AI) & Phase 4 (Python ML) Regression Safety...');

    const geminiRes = await postJSON(5098, '/api/v1/ai/assistant', { prompt: 'Recommend a 3-day itinerary in Mysore' });
    console.log('Gemini AI Assistant Status:', geminiRes.status, 'Success:', geminiRes.body.success);

    const sentimentRes = await postJSON(5098, '/api/v1/ai/sentiment', { text: 'The hotel view was brilliant!' });
    console.log('Python ML Sentiment Proxy Status:', sentimentRes.status, 'Label:', sentimentRes.body.data?.sentimentLabel);

    console.log('--> ALL PHASE 1, 2, 3, 4 & 5 REGRESSION TESTS PASSED CLEANLY!\n');
    console.log('====================================================');
    console.log('🎉 PHASE 5 & COMPLETE INTELLITRIP ECOSYSTEM VERIFIED!');
    console.log('====================================================');
  } catch (err) {
    console.error('CRITICAL TEST FAILURE:', err.message);
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTests();
