import express from 'express';
import {
  triggerSOS,
  getHelplineContacts,
  getEmergencyAlerts,
  updateAlertStatus
} from '../controllers/emergencyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/contacts', getHelplineContacts);
router.post('/sos', protect, triggerSOS);

// Admin & Support Executive Only
router.get(
  '/alerts',
  protect,
  authorize('Super Admin', 'Tourism Department Admin', 'Support Executive'),
  getEmergencyAlerts
);

router.put(
  '/alerts/:id',
  protect,
  authorize('Super Admin', 'Tourism Department Admin', 'Support Executive'),
  updateAlertStatus
);

export default router;
