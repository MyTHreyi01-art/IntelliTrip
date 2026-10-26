import mongoose from 'mongoose';

const emergencyAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    userPhone: {
      type: String,
      default: 'Not Provided'
    },
    location: {
      type: String,
      required: [true, 'Location is required for emergency SOS']
    },
    address: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      enum: ['Medical', 'Police', 'Accident', 'Lost', 'Other'],
      default: 'Medical'
    },
    status: {
      type: String,
      enum: ['Active', 'In Progress', 'Resolved'],
      default: 'Active'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const EmergencyAlert = mongoose.model('EmergencyAlert', emergencyAlertSchema);
export default EmergencyAlert;
