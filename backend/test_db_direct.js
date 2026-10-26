import mongoose from 'mongoose';
import User from './models/User.js';

async function testDirect() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect('mongodb://localhost:27017/intellitrip');
  console.log('Connected!');

  console.log('Creating user...');
  try {
    const u = await User.create({
      name: 'Direct Test User',
      email: `test_${Date.now()}@example.com`,
      password: 'password123',
      role: 'Tourist'
    });
    console.log('User created:', u._id);
  } catch (e) {
    console.error('Error creating user:', e);
  }

  await mongoose.disconnect();
  console.log('Done!');
}

testDirect();
