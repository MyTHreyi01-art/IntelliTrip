import express from 'express';
import {
  createReview,
  getReviewsByTarget
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/target/:targetId', getReviewsByTarget);

export default router;
