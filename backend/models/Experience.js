import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: false
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: ['Adventure', 'Trekking', 'Water Sports', 'Food Tour', 'Cultural Walk', 'Heritage Tour', 'Safari', 'Photography', 'Camping', 'Paragliding']
    },
    duration: {
      type: String,
      default: '3 Hours'
    },
    pricePerPerson: {
      type: Number,
      required: true
    },
    maxGroupSize: {
      type: Number,
      default: 10
    },
    includedServices: [{ type: String }],
    images: [{ type: String }],
    rating: {
      type: Number,
      default: 4.8
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Experience = mongoose.model('Experience', experienceSchema);
export default Experience;
