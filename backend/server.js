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
import communityRoutes from './routes/communityRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import loyaltyRoutes from './routes/loyaltyRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Static file serving for images & uploads
app.use('/images', express.static(path.join(__dirname, 'uploads/images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'https://intellitrip-frontend.onrender.com',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parser with 50mb limit for local image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'IntelliTrip Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
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
app.use('/api/v1/community', communityRoutes);
app.use('/api/v1/emergency', emergencyRoutes);
app.use('/api/v1/loyalty', loyaltyRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/upload', uploadRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('IntelliTrip Smart Tourism API Server is running smoothly...');
});

// Middleware for 404 handling and centralized errors
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database first, then start listening
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[IntelliTrip Server] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`[IntelliTrip Server] Health Check available at http://localhost:${PORT}/api/health`);
  });
};

startServer();
