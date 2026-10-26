import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fullName: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    itemType: {
      type: String,
      required: true,
      enum: ['Hotel', 'Transport', 'Experience', 'Restaurant', 'Destination']
    },
    itemRef: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'itemModel'
    },
    itemModel: {
      type: String,
      required: true,
      enum: ['Hotel', 'Transport', 'Experience', 'Restaurant', 'Destination']
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room'
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    reservationTime: {
      type: String,
      default: ''
    },
    contactPhone: {
      type: String,
      default: ''
    },
    guests: {
      type: Number,
      default: 1
    },
    totalPrice: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      enum: ['USD', 'INR'],
      default: 'INR'
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
      default: 'Confirmed'
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded'],
      default: 'Pending'
    },
    specialRequests: {
      type: String,
      default: ''
    },
    emailConfirmationSent: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ user: 1, status: 1, createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
