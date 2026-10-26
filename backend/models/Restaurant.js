import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema(
  {
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: false
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    cuisine: {
      type: String,
      required: true
    },
    priceRange: {
      type: String,
      default: '₹₹ (₹1,000–₹2,500 for two)'
    },
    averagePriceForTwo: {
      type: Number,
      min: 0,
      default: 2000
    },
    address: {
      type: String,
      default: 'Heritage Culinary Quarter'
    },
    city: {
      type: String,
      required: true
    },
    openingHours: {
      type: String,
      default: '10:00 AM - 11:00 PM'
    },
    description: {
      type: String,
      default: ''
    },
    rating: {
      type: Number,
      default: 4.5
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    images: [{ type: String }],
    contactPhone: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;
