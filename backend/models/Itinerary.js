import mongoose from 'mongoose';

const dayPlanSchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  theme: { type: String, default: '' },
  morning: { type: String, required: true },
  afternoon: { type: String, required: true },
  evening: { type: String, required: true },
  schedule: [{
    time: { type: String, default: '' },
    activity: { type: String, default: '' },
    location: { type: String, default: '' },
    duration: { type: String, default: '' }
  }],
  meals: {
    breakfast: { type: String, default: '' },
    lunch: { type: String, default: '' },
    dinner: { type: String, default: '' }
  },
  transport: { type: String, default: '' },
  stay: { type: String, default: '' },
  highlights: [{ type: String }],
  tips: [{ type: String }],
  estimatedCost: { type: Number, default: 0 }
});

const itinerarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    destinationName: {
      type: String,
      required: true
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination'
    },
    durationDays: {
      type: Number,
      required: true,
      default: 3
    },
    travelers: {
      type: Number,
      default: 2
    },
    totalBudget: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    estimatedExpenses: {
      accommodation: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      activities: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    interests: [{ type: String }],
    dayPlans: [dayPlanSchema],
    status: {
      type: String,
      enum: ['Draft', 'Saved', 'Active', 'Completed'],
      default: 'Saved'
    }
  },
  {
    timestamps: true
  }
);

itinerarySchema.index({ user: 1, createdAt: -1 });

const Itinerary = mongoose.model('Itinerary', itinerarySchema);
export default Itinerary;
