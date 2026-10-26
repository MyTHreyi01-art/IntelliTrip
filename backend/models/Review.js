import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    targetType: {
      type: String,
      required: true,
      enum: ['Destination', 'Hotel', 'Restaurant', 'Experience', 'Transport']
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating (1-5) is required'],
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true
    },
    sentimentScore: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

reviewSchema.index({ targetId: 1, targetType: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
