import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    destinations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
    hotels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' }],
    experiences: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Experience' }],
    restaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }]
  },
  {
    timestamps: true
  }
);

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;
