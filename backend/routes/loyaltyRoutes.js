import express from 'express';
import {
  getLoyaltyProfile,
  earnPoints,
  redeemPoints
} from '../controllers/loyaltyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getLoyaltyProfile);
router.post('/earn', protect, earnPoints);
router.post('/redeem', protect, redeemPoints);

export default router;
