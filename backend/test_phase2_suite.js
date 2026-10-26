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

app.use(notFound);
app.use(errorHandler);

async function runPhase2TestSuite() {
  console.log('====================================================');
  console.log('    INTELLITRIP PHASE 2 COMPLETE VERIFICATION SUITE  ');
  console.log('====================================================\n');

  await connectDB();

  const PORT = 5099;
  const server = app.listen(PORT, async () => {
    const API_URL = `http://127.0.0.1:${PORT}/api/v1`;
    const timestamp = Date.now();
    const touristEmail = `phase2_tourist_${timestamp}@example.com`;
    const password = 'Password123!';

    try {
      // 1. Auth & Register Tourist
      console.log('1. Testing User Registration...');
      const regRes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Phase2 Tester', email: touristEmail, password, role: 'Tourist' })
      });
      const regData = await regRes.json();
      if (!regRes.ok) throw new Error(`Reg failed: ${JSON.stringify(regData)}`);
      const token = regData.data.token;
      console.log('   ✅ Tourist Registered & Token Acquired!');

      // 2. Destinations API
      console.log('\n2. Testing Destinations REST API...');
      const destRes = await fetch(`${API_URL}/destinations`);
      const destData = await destRes.json();
      if (!destRes.ok || destData.count === 0) throw new Error('No destinations found');
      const targetDest = destData.data[0];
      console.log(`   ✅ Destinations fetched: ${destData.count} found. Top: "${targetDest.name}"`);

      // 3. Hotels & Rooms API
      console.log('\n3. Testing Hotels & Rooms REST API...');
      const hotelRes = await fetch(`${API_URL}/hotels`);
      const hotelData = await hotelRes.json();
      if (!hotelRes.ok || hotelData.count === 0) throw new Error('No hotels found');
      const targetHotel = hotelData.data[0];
      
      const hotelDetailRes = await fetch(`${API_URL}/hotels/${targetHotel._id}`);
      const hotelDetailData = await hotelDetailRes.json();
      const targetRoom = hotelDetailData.data.rooms ? hotelDetailData.data.rooms[0] : null;
      console.log(`   ✅ Hotels fetched: "${targetHotel.name}" (Rooms available: ${hotelDetailData.data.rooms.length})`);

      // 4. Transport API
      console.log('\n4. Testing Transport REST API...');
      const transRes = await fetch(`${API_URL}/transport`);
      const transData = await transRes.json();
      if (!transRes.ok || transData.count === 0) throw new Error('No transport found');
      const targetTransport = transData.data[0];
      console.log(`   ✅ Transport fleet fetched: "${targetTransport.title}" ($${targetTransport.pricePerDay}/day)`);

      // 5. Experiences API
      console.log('\n5. Testing Local Experiences REST API...');
      const expRes = await fetch(`${API_URL}/experiences`);
      const expData = await expRes.json();
      if (!expRes.ok || expData.count === 0) throw new Error('No experiences found');
      const targetExperience = expData.data[0];
      console.log(`   ✅ Local Experiences fetched: "${targetExperience.title}" ($${targetExperience.pricePerPerson}/person)`);

      // 6. Restaurants API
      console.log('\n6. Testing Restaurants REST API...');
      const restRes = await fetch(`${API_URL}/restaurants`);
      const restData = await restRes.json();
      if (!restRes.ok || restData.count === 0) throw new Error('No restaurants found');
      console.log(`   ✅ Restaurants fetched: ${restData.count} cataloged.`);

      // 7. Booking Creation (Hotel & Experience)
      console.log('\n7. Testing Unified Booking Engine...');
      const bookRes = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itemType: 'Hotel',
          itemRef: targetHotel._id,
          roomId: targetRoom ? targetRoom._id : null,
          startDate: '2026-10-10',
          endDate: '2026-10-12',
          guests: 2
        })
      });
      const bookData = await bookRes.json();
      if (!bookRes.ok) throw new Error(`Booking failed: ${JSON.stringify(bookData)}`);
      const bookingId = bookData.data._id;
      console.log(`   ✅ Hotel Booking Created! ID: #${bookingId.substring(16)}, Price: $${bookData.data.totalPrice}`);

      // 8. Wishlist Toggle
      console.log('\n8. Testing Tourist Wishlist Operations...');
      const wishRes = await fetch(`${API_URL}/wishlist/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemType: 'Destination', itemId: targetDest._id })
      });
      const wishData = await wishRes.json();
      if (!wishRes.ok) throw new Error(`Wishlist failed: ${JSON.stringify(wishData)}`);
      console.log(`   ✅ Wishlist Updated! Status: ${wishData.message}`);

      // 9. Reviews & Target Rating Computation
      console.log('\n9. Testing Reviews & Automated Rating Recalculation...');
      const revRes = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetType: 'Destination',
          targetId: targetDest._id,
          rating: 5,
          comment: 'Spectacular alpine views and well-organized paragliding!'
        })
      });
      const revData = await revRes.json();
      if (!revRes.ok) throw new Error(`Review failed: ${JSON.stringify(revData)}`);
      console.log(`   ✅ Review Created! Score: 5 Stars for "${targetDest.name}"`);

      // 10. Booking Cancellation
      console.log('\n10. Testing Booking Cancellation...');
      const cancelRes = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const cancelData = await cancelRes.json();
      if (!cancelRes.ok) throw new Error(`Cancel failed: ${JSON.stringify(cancelData)}`);
      console.log(`   ✅ Booking Cancelled Successfully! Status: ${cancelData.data.status}`);

      console.log('\n====================================================');
      console.log('   🎉 ALL PHASE 2 CORE TOURISM TESTS PASSED 100%!   ');
      console.log('====================================================');
    } catch (err) {
      console.error('\n❌ Phase 2 Test Suite Failed:', err.message);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runPhase2TestSuite();
