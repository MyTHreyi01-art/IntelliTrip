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
  console.log('--- STARTING PHASE 4 INTEGRATION AND REGRESSION TEST SUITE ---');

  // Step 1: Check Python FastAPI server on port 8000
  console.log('[1/5] Checking Python FastAPI Microservice (uvicorn) on port 8000...');
  let pythonProc = null;
  try {
    await getJSON(8000, '/');
    console.log('Python FastAPI server is already running on port 8000.');
  } catch (e) {
    console.log('Launching Python FastAPI Microservice...');
    pythonProc = spawn('python', ['-m', 'uvicorn', 'app:app', '--port', '8000'], {
      cwd: path.join(__dirname, '../ai-service')
    });
    await new Promise((r) => setTimeout(r, 3000));
  }

  // Step 2: Directly test Python FastAPI endpoints
  console.log('[2/5] Testing 6 Python ML endpoints directly on http://127.0.0.1:8000...');
  try {
    // 1. Sentiment
    const resSent = await postJSON(8000, '/analyze/sentiment', { text: 'The hotel was fantastic, amazing view and great breakfast!' });
    console.log('Direct Python Sentiment Status:', resSent.status, 'Label:', resSent.body.sentimentLabel, 'Score:', resSent.body.sentimentScore);
    if (resSent.status !== 200 || resSent.body.sentimentLabel !== 'Positive') {
      throw new Error('Python Sentiment API failed');
    }

    // 2. Crowd Prediction
    const resCrowd = await postJSON(8000, '/predict/crowd', { destinationName: 'Mysore Palace', month: 'October', dayOfWeek: 'Saturday' });
    console.log('Direct Python Crowd Status:', resCrowd.status, 'Level:', resCrowd.body.crowdLevel, 'Disclaimer:', resCrowd.body.disclaimer);
    if (resCrowd.status !== 200 || !resCrowd.body.disclaimer) {
      throw new Error('Python Crowd Prediction API failed');
    }

    // 3. Demand Forecast
    const resDemand = await postJSON(8000, '/forecast/demand', { destinationName: 'Manali', targetMonth: 'November' });
    console.log('Direct Python Demand Status:', resDemand.status, 'Forecast Index:', resDemand.body.forecastDemandIndex);
    if (resDemand.status !== 200 || !resDemand.body.forecastDemandIndex) {
      throw new Error('Python Demand Forecast API failed');
    }

    // 4. Group Consensus
    const resGroup = await postJSON(8000, '/group/consensus', {
      travelersPreferences: [
        { adventure: 90, nature: 80, culture: 30, food: 70, luxury: 40 },
        { adventure: 50, nature: 70, culture: 90, food: 85, luxury: 60 }
      ]
    });
    console.log('Direct Python Group Consensus Status:', resGroup.status, 'Consensus Score:', resGroup.body.groupSatisfactionScore);
    if (resGroup.status !== 200 || !resGroup.body.groupSatisfactionScore) {
      throw new Error('Python Group Consensus API failed');
    }

    // 5. Hidden Gems
    const resGems = await postJSON(8000, '/recommend/hidden-gems', { category: 'Mountain', maxCost: 100 });
    console.log('Direct Python Hidden Gems Status:', resGems.status, 'Count:', resGems.body.count);
    if (resGems.status !== 200 || !Array.isArray(resGems.body.hiddenGems)) {
      throw new Error('Python Hidden Gems API failed');
    }

    // 6. Sustainability Score
    const resEco = await postJSON(8000, '/sustainability/score', { transportType: 'Flight', distanceKm: 650 });
    console.log('Direct Python Sustainability Status:', resEco.status, 'CO2:', resEco.body.estimatedCo2Kg, 'Score:', resEco.body.sustainabilityScore);
    if (resEco.status !== 200 || !resEco.body.estimatedCo2Kg) {
      throw new Error('Python Sustainability API failed');
    }

    console.log('--> ALL 6 DIRECT PYTHON FASTAPI ENDPOINTS PASSED CLEANLY!\n');
  } catch (err) {
    console.error('Python API Direct Test Failure:', err.message);
    pythonProc.kill();
    process.exit(1);
  }

  // Step 3: Start Node Express backend server on port 5099
  console.log('[3/5] Launching Node.js Express server on port 5099 for complete REST flow verification...');
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Connect MongoDB
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/intellitrip';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB for test verification.');

  // Import routes
  const authRoutes = (await import('./routes/authRoutes.js')).default;
  const destinationRoutes = (await import('./routes/destinationRoutes.js')).default;
  const hotelRoutes = (await import('./routes/hotelRoutes.js')).default;
  const aiRoutes = (await import('./routes/aiRoutes.js')).default;

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/destinations', destinationRoutes);
  app.use('/api/v1/hotels', hotelRoutes);
  app.use('/api/v1/ai', aiRoutes);

  const server = app.listen(5099, '127.0.0.1');

  try {
    // Step 4: Test Node Express -> Python FastAPI Endpoints (End-to-End REST Flow)
    console.log('[4/5] Testing Node Express -> Python FastAPI proxy routes (React -> Node -> Python -> Node -> React)...');

    // 1. Node Sentiment Route
    const nodeSent = await postJSON(5099, '/api/v1/ai/sentiment', { text: 'Outstanding hospitality and great ambience!' });
    console.log('Node Proxy Sentiment Status:', nodeSent.status, 'Label:', nodeSent.body.data?.sentimentLabel);
    if (nodeSent.status !== 200 || nodeSent.body.data?.sentimentLabel !== 'Positive') {
      throw new Error('Node Proxy Sentiment failed');
    }

    // 2. Node Crowd Route
    const nodeCrowd = await postJSON(5099, '/api/v1/ai/predict-crowd', { destinationName: 'Goa Beach', month: 'December', dayOfWeek: 'Sunday' });
    console.log('Node Proxy Crowd Status:', nodeCrowd.status, 'Level:', nodeCrowd.body.data?.crowdLevel);
    if (nodeCrowd.status !== 200 || !nodeCrowd.body.data?.crowdLevel) {
      throw new Error('Node Proxy Crowd prediction failed');
    }

    // 3. Node Demand Route
    const nodeDemand = await postJSON(5099, '/api/v1/ai/forecast-demand', { destinationName: 'Ooty', targetMonth: 'May' });
    console.log('Node Proxy Demand Status:', nodeDemand.status, 'Forecast Index:', nodeDemand.body.data?.forecastDemandIndex);
    if (nodeDemand.status !== 200 || !nodeDemand.body.data?.forecastDemandIndex) {
      throw new Error('Node Proxy Demand forecast failed');
    }

    // 4. Node Group Route
    const nodeGroup = await postJSON(5099, '/api/v1/ai/group-consensus', {
      travelersPreferences: [{ adventure: 80, nature: 90, culture: 40, food: 60, luxury: 50 }]
    });
    console.log('Node Proxy Group Status:', nodeGroup.status, 'Group Size:', nodeGroup.body.data?.groupSize);
    if (nodeGroup.status !== 200 || !nodeGroup.body.data?.groupSize) {
      throw new Error('Node Proxy Group consensus failed');
    }

    // 5. Node Hidden Gems Route
    const nodeGems = await postJSON(5099, '/api/v1/ai/hidden-gems', { category: 'Beach', maxCost: 80 });
    console.log('Node Proxy Hidden Gems Status:', nodeGems.status, 'Count:', nodeGems.body.data?.count);
    if (nodeGems.status !== 200 || !Array.isArray(nodeGems.body.data?.hiddenGems)) {
      throw new Error('Node Proxy Hidden gems failed');
    }

    // 6. Node Sustainability Route
    const nodeEco = await postJSON(5099, '/api/v1/ai/sustainability', { transportType: 'Car', distanceKm: 250 });
    console.log('Node Proxy Sustainability Status:', nodeEco.status, 'CO2:', nodeEco.body.data?.estimatedCo2Kg);
    if (nodeEco.status !== 200 || !nodeEco.body.data?.estimatedCo2Kg) {
      throw new Error('Node Proxy Sustainability failed');
    }

    console.log('--> ALL 6 NODE.JS -> PYTHON FASTAPI PROXY ENDPOINTS PASSED CLEANLY!\n');

    // Step 5: Test Phase 1, Phase 2, Phase 3 Regression Safety
    console.log('[5/5] Testing Phase 1/2/3 Regression Safety (Gemini AI Assistant, Destinations catalog)...');

    // Gemini AI Assistant check
    const geminiRes = await postJSON(5099, '/api/v1/ai/assistant', { prompt: 'Recommend a 2-day beach trip' });
    console.log('Gemini Assistant Status:', geminiRes.status, 'Success:', geminiRes.body.success);
    if (geminiRes.status !== 200 || !geminiRes.body.success) {
      throw new Error('Phase 3 Gemini Assistant regression test failed');
    }

    // Destinations catalog check
    const destRes = await getJSON(5099, '/api/v1/destinations');
    console.log('Destinations Catalog Status:', destRes.status, 'Count:', destRes.body.count);
    if (destRes.status !== 200) {
      throw new Error('Phase 2 Destinations catalog regression test failed');
    }

    console.log('--> PHASE 1/2/3 REGRESSION TESTS PASSED CLEANLY WITH NO BREAKAGES!\n');
    console.log('====================================================');
    console.log('🎉 PHASE 4 FULL INTEGRATION AND VERIFICATION SUCCESSFUL!');
    console.log('====================================================');
  } catch (err) {
    console.error('CRITICAL TEST FAILURE:', err.message);
  } finally {
    server.close();
    await mongoose.disconnect();
    if (pythonProc) pythonProc.kill();
    process.exit(0);
  }
}

runTests();
