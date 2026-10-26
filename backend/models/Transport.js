import mongoose from 'mongoose';

const transportSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['Taxi', 'Bus', 'Car Rental', 'Bike Rental', 'Private Shuttle']
    },
    title: {
      type: String,
      required: true
    },
    vehicleModel: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      required: true
    },
    pricePerDay: {
      type: Number,
      required: true
    },
    capacity: {
      type: Number,
      default: 4
    },
    features: [{ type: String }],
    images: [{ type: String }],
    isAvailable: {
      type: Boolean,
      default: true
    },
    rating: {
      type: Number,
      default: 4.8
    }
  },
  {
    timestamps: true
  }
);

const Transport = mongoose.model('Transport', transportSchema);
export default Transport;
