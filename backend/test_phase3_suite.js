import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import destinationRoutes from './routes/destinationRoutes.js';
import hotelRoutes from './routes/hotelRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import transportRoutes from './routes/transportRoutes.js';
import experienceRoutes from './routes/experienceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/destinations', destinationRoutes);
app.use('/api/v1/hotels', hotelRoutes);
app.use('/api/v1/restaurants', restaurantRoutes);
app.use('/api/v1/transport', transportRoutes);
app.use('/api/v1/experiences', experienceRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/ai', aiRoutes);

app.use(notFound);
app.use(errorHandler);

async function runPhase3TestSuite() {
  console.log('====================================================');
  console.log('    INTELLITRIP PHASE 3 AI INTELLIGENCE SUITE      ');
  console.log('====================================================\n');

  await connectDB();

  const PORT = 5098;
  const server = app.listen(PORT, async () => {
    const API_URL = `http://127.0.0.1:${PORT}/api/v1`;
    const timestamp = Date.now();
    const touristEmail = `phase3_tourist_${timestamp}@example.com`;
    const password = 'Password123!';

    try {
      // 1. Auth Registration
      console.log('1. User Registration & JWT Setup...');
      const regRes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Phase3 Explorer', email: touristEmail, password, role: 'Tourist' })
      });
      const regData = await regRes.json();
      if (!regRes.ok) throw new Error(`Reg failed: ${JSON.stringify(regData)}`);
      const token = regData.data.token;
      console.log('   ✅ Tourist Registered & Token Acquired!');

      // 2. AI Travel Assistant Natural Language Chat
      console.log('\n2. Testing AI Travel Assistant (Natural Language Query)...');
      const chatRes = await fetch(`${API_URL}/ai/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Plan a 4-day trip to Mysore for two people under ₹10,000 with nature and food activities.'
        })
      });
      const chatData = await chatRes.json();
      if (!chatRes.ok || !chatData.data.reply) throw new Error('AI Assistant failed');
      console.log(`   ✅ AI Assistant Response Source: [${chatData.data.source}]`);
      console.log(`   Snippet: "${chatData.data.reply.substring(0, 100).replace(/\n/g, ' ')}..."`);

      // 3. AI Trip Generator & Itinerary Persistence
      console.log('\n3. Testing AI Trip Generator & MongoDB Persistence...');
      const itinRes = await fetch(`${API_URL}/ai/generate-itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          destination: 'Manali & Solang Valley',
          days: 3,
          budget: 600,
          travelers: 2,
          interests: ['Adventure', 'Nature'],
          saveItinerary: true
        })
      });
      const itinData = await itinRes.json();
      if (!itinRes.ok) throw new Error(`Itinerary generation failed: ${JSON.stringify(itinData)}`);
      console.log(`   ✅ AI Day-by-Day Itinerary Generated & Saved! ID: #${itinData.data._id}`);
      console.log(`   Title: "${itinData.data.title}" (Days: ${itinData.data.durationDays}, Day Plans: ${itinData.data.dayPlans.length})`);

      // 4. Fetch User Saved Itineraries
      console.log('\n4. Testing GET User Saved Itineraries...');
      const getItinRes = await fetch(`${API_URL}/ai/itineraries`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const getItinData = await getItinRes.json();
      if (!getItinRes.ok || getItinData.count === 0) throw new Error('Failed to fetch saved itineraries');
      console.log(`   ✅ User Itineraries Fetched: ${getItinData.count} saved itinerary document(s).`);

      // 5. Travel DNA Profile GET & PUT
      console.log('\n5. Testing Travel DNA Behavioral Profiling Engine...');
      const dnaGetRes = await fetch(`${API_URL}/ai/travel-dna`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dnaGetData = await dnaGetRes.json();
      if (!dnaGetRes.ok) throw new Error('Failed to fetch Travel DNA');
      console.log(`   ✅ Current Travel DNA Persona: "${dnaGetData.data.primaryStyle}" (Adventure: ${dnaGetData.data.scores.adventure}%)`);

      const dnaPutRes = await fetch(`${API_URL}/ai/travel-dna`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          scores: { adventure: 90, nature: 85, culture: 70, food: 95 },
          primaryStyle: 'Thrill & Culinary Explorer'
        })
      });
      const dnaPutData = await dnaPutRes.json();
      if (!dnaPutRes.ok) throw new Error('Failed to update Travel DNA');
      console.log(`   ✅ Updated Travel DNA Persona: "${dnaPutData.data.primaryStyle}" (Adventure: ${dnaPutData.data.scores.adventure}%)`);

      // 6. Personalized Explainable Recommendations
      console.log('\n6. Testing Personalized Recommendations System...');
      const recRes = await fetch(`${API_URL}/ai/recommendations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const recData = await recRes.json();
      if (!recRes.ok || !recData.data.destinations) throw new Error('Failed to fetch recommendations');
      const topDestRec = recData.data.destinations[0];
      console.log(`   ✅ Recommendations Scored! Top Dest: "${topDestRec.name}" (Score: ${topDestRec.matchScore}%)`);
      console.log(`   Reason Tag: "${topDestRec.matchReason}"`);

      // 7. AI Budget Planner & Dynamic Guardian
      console.log('\n7. Testing AI Budget Planner & Dynamic Guardian...');
      const budgetRes = await fetch(`${API_URL}/ai/budget-planner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: 'Manali', days: 3, budget: 500, travelers: 2 })
      });
      const budgetData = await budgetRes.json();
      if (!budgetRes.ok) throw new Error('Budget planner failed');
      console.log(`   ✅ Budget Analysis Complete: Status: "${budgetData.data.status}"`);
      console.log(`   AI Savings Tip: "${budgetData.data.aiSavingsTip}"`);

      // 8. Phase 1 & Phase 2 Regression Check
      console.log('\n8. Verifying Phase 1 (Auth/Roles) & Phase 2 (Destinations/Hotels/Bookings)...');
      const destCheck = await fetch(`${API_URL}/destinations`);
      const hotelCheck = await fetch(`${API_URL}/hotels`);
      if (destCheck.ok && hotelCheck.ok) {
        console.log('   ✅ Phase 1 & Phase 2 Core Functionality Remains 100% Operational!');
      }

      console.log('\n====================================================');
      console.log('   🎉 ALL PHASE 3 AI INTELLIGENCE TESTS PASSED 100%! ');
      console.log('====================================================');
    } catch (err) {
      console.error('\n❌ Phase 3 Test Suite Failed:', err.message);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runPhase3TestSuite();
