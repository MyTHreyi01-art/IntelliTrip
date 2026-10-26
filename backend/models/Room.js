import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true
    },
    roomType: {
      type: String,
      required: true,
      enum: ['Standard', 'Deluxe', 'Executive Suite', 'Family Room', 'Penthouse', 'Single', 'Double']
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    pricePerNight: {
      type: Number,
      required: true
    },
    capacity: {
      type: Number,
      required: true,
      default: 2
    },
    amenities: [{ type: String }],
    totalRooms: {
      type: Number,
      default: 10
    },
    availableRooms: {
      type: Number,
      default: 10
    },
    images: [{ type: String }]
  },
  {
    timestamps: true
  }
);

const Room = mongoose.model('Room', roomSchema);
export default Room;
