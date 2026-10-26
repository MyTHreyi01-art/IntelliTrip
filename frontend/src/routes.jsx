import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/auth/Profile';
import TouristDashboard from './pages/tourist/TouristDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// Phase 2 Tourism Pages
import Destinations from './pages/destinations/Destinations';
import DestinationDetails from './pages/destinations/DestinationDetails';
import Hotels from './pages/hotels/Hotels';
import HotelDetails from './pages/hotels/HotelDetails';
import Experiences from './pages/experiences/Experiences';
import Transport from './pages/transport/Transport';
import Restaurants from './pages/food/Restaurants';
import MyBookings from './pages/bookings/MyBookings';
import Wishlist from './pages/tourist/Wishlist';
import ManageListings from './pages/business/ManageListings';

// Phase 3 AI Intelligence Pages
import AITripPlanner from './pages/itinerary/AITripPlanner';
import TravelDNA from './pages/tourist/TravelDNA';
import Recommendations from './pages/ai/Recommendations';

// Phase 4 Advanced Python ML Tools
import AdvancedAITools from './pages/ai/AdvancedAITools';

// Phase 5 Complete Ecosystem Pages
import TravelCommunity from './pages/community/TravelCommunity';
import EmergencyAssistant from './pages/emergency/EmergencyAssistant';
import OfflineTrips from './pages/tourist/OfflineTrips';
import LoyaltyRewards from './pages/tourist/LoyaltyRewards';
import RoleDashboard from './pages/business/RoleDashboard';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';

import PlaceholderPage from './pages/PlaceholderPage';
import ProtectedRoute from './components/common/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/community" element={<TravelCommunity />} />
      <Route path="/emergency" element={<EmergencyAssistant />} />

      {/* Public Tourism Modules (Phase 2 & Phase 5) */}
      <Route path="/destinations" element={<Destinations />} />
      <Route path="/destinations/:id" element={<DestinationDetails />} />
      <Route path="/hotels" element={<Hotels />} />
      <Route path="/hotels/:id" element={<HotelDetails />} />
      <Route path="/experiences" element={<Experiences />} />
      <Route path="/transport" element={<Transport />} />
      <Route path="/restaurants" element={<Restaurants />} />
      <Route path="/loyalty" element={<LoyaltyRewards />} />

      {/* AI Intelligence & ML Modules (Phase 3 & Phase 4) */}
      <Route path="/ai-planner" element={<AITripPlanner />} />
      <Route path="/ai-advanced" element={<AdvancedAITools />} />

      {/* Protected Tourist Routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/travel-dna"
        element={
          <ProtectedRoute>
            <TravelDNA />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recommendations"
        element={
          <ProtectedRoute>
            <Recommendations />
          </ProtectedRoute>
        }
      />

      <Route
        path="/offline-trips"
        element={
          <ProtectedRoute>
            <OfflineTrips />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tourist/dashboard"
        element={
          <ProtectedRoute>
            <TouristDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tourist/bookings"
        element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tourist/wishlist"
        element={
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        }
      />

      {/* Protected Business / Role Dashboards (Phase 5) */}
      <Route
        path="/business/listings"
        element={
          <ProtectedRoute allowedRoles={['Hotel Owner', 'Tour Guide', 'Travel Agency', 'Transport Provider', 'Local Business Owner', 'Super Admin']}>
            <ManageListings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vendor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Tour Guide', 'Hotel Owner', 'Travel Agency', 'Transport Provider', 'Local Business Owner', 'Tourism Department Admin', 'Support Executive', 'Super Admin']}>
            <RoleDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute allowedRoles={['Super Admin', 'Tourism Department Admin', 'Support Executive', 'Hotel Owner', 'Tour Guide', 'Travel Agency', 'Transport Provider', 'Local Business Owner']}>
            <AnalyticsDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Super Admin', 'Tourism Department Admin', 'Support Executive']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback 404 Route */}
      <Route path="*" element={<PlaceholderPage title="404 — Page Not Found" phase="1" />} />
    </Routes>
  );
};

export default AppRoutes;
