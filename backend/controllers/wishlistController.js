import Wishlist from '../models/Wishlist.js';

// @desc    Get current user's wishlist
// @route   GET /api/v1/wishlist
// @access  Private
export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('destinations')
      .populate('hotels')
      .populate('experiences')
      .populate('restaurants');

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, destinations: [], hotels: [], experiences: [], restaurants: [] });
    }

    res.json({ success: true, data: wishlist });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to wishlist
// @route   POST /api/v1/wishlist/toggle
// @access  Private
export const toggleWishlistItem = async (req, res, next) => {
  try {
    const { itemType, itemId } = req.body;
    if (!itemType || !itemId) {
      return res.status(400).json({ success: false, message: 'itemType and itemId are required' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id });
    }

    const fieldMap = {
      Destination: 'destinations',
      Hotel: 'hotels',
      Experience: 'experiences',
      Restaurant: 'restaurants'
    };

    const targetArrayName = fieldMap[itemType];
    if (!targetArrayName) {
      return res.status(400).json({ success: false, message: 'Invalid itemType for wishlist' });
    }

    const array = wishlist[targetArrayName];
    const index = array.indexOf(itemId);
    let added = false;

    if (index > -1) {
      // Remove item
      array.splice(index, 1);
      added = false;
    } else {
      // Add item
      array.push(itemId);
      added = true;
    }

    await wishlist.save();

    res.json({
      success: true,
      message: added ? 'Item added to wishlist' : 'Item removed from wishlist',
      isWishlisted: added,
      data: wishlist
    });
  } catch (error) {
    next(error);
  }
};
