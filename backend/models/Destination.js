import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Destination name is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      default: ''
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      default: 'India'
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    historicalBackground: {
      type: String,
      default: ''
    },
    knownFor: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Mountain', 'Beach', 'Historical', 'Cultural', 'Adventure', 'Nature', 'Urban', 'Wildlife', 'Religous', 'Desert'],
      default: 'Mountain'
    },
    bestTimeToVisit: {
      type: String,
      default: 'October to March'
    },
    averageCostPerDay: {
      type: Number,
      required: [true, 'Average cost per day is required'],
      default: 50
    },
    images: [
      {
        type: String
      }
    ],
    attractions: [
      {
        name: { type: String, required: true },
        description: { type: String, default: '' },
        image: { type: String, default: '' },
        whyNotMiss: { type: String, default: '' }
      }
    ],
    tags: [{ type: String }],
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

destinationSchema.index({ name: 'text', city: 'text', description: 'text', category: 1 });

const Destination = mongoose.model('Destination', destinationSchema);
export default Destination;
