import mongoose from 'mongoose';

const loyaltyProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    points: {
      type: Number,
      default: 100
    },
    tier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      default: 'Bronze'
    },
    badges: [
      {
        name: { type: String, required: true },
        icon: { type: String, default: '🏆' },
        earnedAt: { type: Date, default: Date.now }
      }
    ],
    transactions: [
      {
        action: { type: String, required: true },
        points: { type: Number, required: true },
        description: { type: String, default: '' },
        date: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

const LoyaltyProfile = mongoose.model('LoyaltyProfile', loyaltyProfileSchema);
export default LoyaltyProfile;
