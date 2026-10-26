import LoyaltyProfile from '../models/LoyaltyProfile.js';

// Helper to determine tier based on points
const calculateTier = (points) => {
  if (points >= 1000) return 'Platinum';
  if (points >= 500) return 'Gold';
  if (points >= 250) return 'Silver';
  return 'Bronze';
};

// @desc    Get user loyalty profile
// @route   GET /api/v1/loyalty/profile
// @access  Private
export const getLoyaltyProfile = async (req, res, next) => {
  try {
    let profile = await LoyaltyProfile.findOne({ user: req.user._id });

    if (!profile) {
      profile = await LoyaltyProfile.create({
        user: req.user._id,
        points: 100,
        tier: 'Bronze',
        badges: [
          { name: 'Welcome Explorer', icon: '🌟' }
        ],
        transactions: [
          { action: 'Welcome Bonus', points: 100, description: 'Joined IntelliTrip platform' }
        ]
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Earn loyalty points
// @route   POST /api/v1/loyalty/earn
// @access  Private
export const earnPoints = async (req, res, next) => {
  try {
    const { action, points, description } = req.body;
    const earnedPoints = Number(points) || 50;

    let profile = await LoyaltyProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new LoyaltyProfile({ user: req.user._id });
    }

    profile.points += earnedPoints;
    profile.tier = calculateTier(profile.points);

    profile.transactions.unshift({
      action: action || 'Reward Earned',
      points: earnedPoints,
      description: description || 'Earned travel rewards points'
    });

    // Check for badge unlocks
    if (profile.points >= 500 && !profile.badges.some((b) => b.name === 'Gold Explorer')) {
      profile.badges.push({ name: 'Gold Explorer', icon: '🥇' });
    }
    if (profile.points >= 1000 && !profile.badges.some((b) => b.name === 'Platinum Traveler')) {
      profile.badges.push({ name: 'Platinum Traveler', icon: '👑' });
    }

    await profile.save();

    res.json({
      success: true,
      message: `Earned ${earnedPoints} IntelliTrip points!`,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Redeem loyalty points
// @route   POST /api/v1/loyalty/redeem
// @access  Private
export const redeemPoints = async (req, res, next) => {
  try {
    const { pointsToRedeem, rewardTitle } = req.body;
    const amount = Number(pointsToRedeem) || 100;

    let profile = await LoyaltyProfile.findOne({ user: req.user._id });
    if (!profile || profile.points < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient loyalty points to redeem this voucher' });
    }

    profile.points -= amount;
    profile.tier = calculateTier(profile.points);

    profile.transactions.unshift({
      action: 'Voucher Redeemed',
      points: -amount,
      description: rewardTitle || 'Redeemed points for travel discount voucher'
    });

    await profile.save();

    res.json({
      success: true,
      message: `Redeemed ${amount} points for: ${rewardTitle || 'Discount Voucher'}`,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};
