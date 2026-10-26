import Restaurant from '../models/Restaurant.js';
import Destination from '../models/Destination.js';
import { recordActivity } from '../models/ActivityLog.js';

// @desc    Get restaurants with search & filters
// @route   GET /api/v1/restaurants
// @access  Public
export const getRestaurants = async (req, res, next) => {
  try {
    const { destinationId, city, cuisine, priceRange, search } = req.query;
    const query = {};

    if (destinationId) query.destination = destinationId;
    if (city) query.city = { $regex: city, $options: 'i' };
    if (cuisine) query.cuisine = { $regex: cuisine, $options: 'i' };
    if (priceRange) {
      query.priceRange = { $regex: priceRange, $options: 'i' };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { cuisine: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    const restaurants = await Restaurant.find(query).populate('destination', 'name city');
    res.json({ success: true, count: restaurants.length, data: restaurants });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant details by ID
// @route   GET /api/v1/restaurants/:id
// @access  Public
export const getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('destination', 'name city');
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    res.json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
};

// @desc    Create restaurant listing
// @route   POST /api/v1/restaurants
// @access  Private
export const createRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.create({
      ...req.body,
      owner: req.user._id
    });

    await recordActivity({
      user: req.user,
      action: 'Created Restaurant',
      module: 'Restaurant',
      details: `${req.user.name} created dining listing "${restaurant.name}" in ${restaurant.city || 'unspecified'}`,
      entityId: restaurant._id,
      metadata: { name: restaurant.name, city: restaurant.city }
    });

    res.status(201).json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
};

// @desc    Update restaurant
// @route   PUT /api/v1/restaurants/:id
// @access  Private
export const updateRestaurant = async (req, res, next) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    if (restaurant.owner && restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this restaurant' });
    }

    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    await recordActivity({
      user: req.user,
      action: 'Updated Restaurant',
      module: 'Restaurant',
      details: `${req.user.name} updated restaurant "${restaurant.name}"`,
      entityId: restaurant._id,
      metadata: { name: restaurant.name }
    });

    res.json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/v1/restaurants/:id
// @access  Private
export const deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    if (restaurant.owner && restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this restaurant' });
    }

    await Restaurant.findByIdAndDelete(req.params.id);

    await recordActivity({
      user: req.user,
      action: 'Deleted Restaurant',
      module: 'Restaurant',
      details: `${req.user.name} deleted restaurant "${restaurant.name}"`,
      entityId: req.params.id,
      metadata: { name: restaurant.name }
    });

    res.json({ success: true, message: 'Restaurant deleted successfully' });
  } catch (error) {
    next(error);
  }
};
