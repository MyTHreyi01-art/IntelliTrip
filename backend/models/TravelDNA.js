import mongoose from 'mongoose';

const travelDNASchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    scores: {
      adventure: { type: Number, default: 75, min: 0, max: 100 },
      nature: { type: Number, default: 80, min: 0, max: 100 },
      culture: { type: Number, default: 60, min: 0, max: 100 },
      food: { type: Number, default: 85, min: 0, max: 100 },
      relaxation: { type: Number, default: 65, min: 0, max: 100 },
      luxury: { type: Number, default: 50, min: 0, max: 100 },
      budget: { type: Number, default: 70, min: 0, max: 100 },
      photography: { type: Number, default: 80, min: 0, max: 100 }
    },
    primaryStyle: {
      type: String,
      default: 'Adventure & Nature Seeker'
    }
  },
  {
    timestamps: true
  }
);

const TravelDNA = mongoose.model('TravelDNA', travelDNASchema);
export default TravelDNA;
