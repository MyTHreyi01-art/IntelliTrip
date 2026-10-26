import express from 'express';
import { getAdvancedAnalytics, getActivityLogs } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get(
  '/overview',
  protect,
  authorize(
    'Super Admin',
    'Tourism Department Admin',
    'Hotel Owner',
    'Tour Guide',
    'Travel Agency',
    'Transport Provider',
    'Local Business Owner',
    'Support Executive'
  ),
  getAdvancedAnalytics
);

router.get(
  '/activities',
  protect,
  authorize('Super Admin', 'Tourism Department Admin'),
  getActivityLogs
);

export default router;
