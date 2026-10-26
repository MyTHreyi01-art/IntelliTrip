import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: false
    },
    name: {
      type: String,
      required: [true, 'Hotel name is required'],
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    address: {
      type: String,
      default: 'Prime Heritage Quarter'
    },
    city: {
      type: String,
      required: true
    },
    amenities: [
      {
        type: String,
        enum: ['WiFi', 'Pool', 'Spa', 'Parking', 'Breakfast', 'Gym', 'AC', 'Restaurant', 'Bar', 'Airport Shuttle']
      }
    ],
    images: [{ type: String }],
    contactPhone: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
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
    startingPrice: {
      type: Number,
      required: true,
      default: 100
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

hotelSchema.index({ destination: 1, city: 1, startingPrice: 1 });

const Hotel = mongoose.model('Hotel', hotelSchema);
export default Hotel;
