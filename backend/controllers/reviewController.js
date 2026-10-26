import Review from '../models/Review.js';
import Destination from '../models/Destination.js';
import Hotel from '../models/Hotel.js';
import Restaurant from '../models/Restaurant.js';
import Experience from '../models/Experience.js';
import Transport from '../models/Transport.js';
import { recordActivity } from '../models/ActivityLog.js';

// Helper to update target rating & review count
const updateTargetRating = async (targetType, targetId) => {
  const reviews = await Review.find({ targetType, targetId });
  const count = reviews.length;
  const avgRating = count > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1) : 4.5;

  if (targetType === 'Destination') {
    await Destination.findByIdAndUpdate(targetId, { rating: Number(avgRating), reviewCount: count });
  } else if (targetType === 'Hotel') {
    await Hotel.findByIdAndUpdate(targetId, { rating: Number(avgRating), reviewCount: count });
  } else if (targetType === 'Restaurant') {
    await Restaurant.findByIdAndUpdate(targetId, { rating: Number(avgRating), reviewCount: count });
  } else if (targetType === 'Experience') {
    await Experience.findByIdAndUpdate(targetId, { rating: Number(avgRating), reviewCount: count });
  } else if (targetType === 'Transport') {
    await Transport.findByIdAndUpdate(targetId, { rating: Number(avgRating) });
  }
};

// @desc    Create review with sentiment tagging
// @route   POST /api/v1/reviews
// @access  Private
export const createReview = async (req, res, next) => {
  try {
    const { targetType, targetId, rating, comment } = req.body;

    if (!targetType || !targetId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide targetType, targetId, rating (1-5), and comment' });
    }

    const numRating = Number(rating);
    const sentimentScore = numRating >= 4 ? 0.8 : numRating === 3 ? 0.0 : -0.8;

    const review = await Review.create({
      user: req.user._id,
      targetType,
      targetId,
      rating: numRating,
      comment,
      sentimentScore
    });

    await updateTargetRating(targetType, targetId);

    const populated = await Review.findById(review._id).populate('user', 'name role avatar');

    await recordActivity({
      user: req.user,
      action: 'Submitted Review',
      module: 'Review',
      details: `${req.user.name} reviewed ${targetType} with rating ${numRating}/5`,
      entityId: review._id,
      metadata: { targetType, targetId, rating: numRating }
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a target entity
// @route   GET /api/v1/reviews/target/:targetId
// @access  Public
export const getReviewsByTarget = async (req, res, next) => {
  try {
    const reviews = await Review.find({ targetId: req.params.targetId })
      .populate('user', 'name role avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};
