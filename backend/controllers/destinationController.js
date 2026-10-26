import Destination from '../models/Destination.js';
import { recordActivity } from '../models/ActivityLog.js';

// @desc    Get all destinations with search & category filter
// @route   GET /api/v1/destinations
// @access  Public
export const getDestinations = async (req, res, next) => {
  try {
    const { search, category, minCost, maxCost, sort } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (minCost || maxCost) {
      query.averageCostPerDay = {};
      if (minCost) query.averageCostPerDay.$gte = Number(minCost);
      if (maxCost) query.averageCostPerDay.$lte = Number(maxCost);
    }

    let sortOption = { rating: -1 };
    if (sort === 'cost_asc') sortOption = { averageCostPerDay: 1 };
    if (sort === 'cost_desc') sortOption = { averageCostPerDay: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const destinations = await Destination.find(query).sort(sortOption);

    res.json({
      success: true,
      count: destinations.length,
      data: destinations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single destination by ID
// @route   GET /api/v1/destinations/:id
// @access  Public
export const getDestinationById = async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }
    res.json({ success: true, data: destination });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new destination (Admin only)
// @route   POST /api/v1/destinations
// @access  Private (Admin)
export const createDestination = async (req, res, next) => {
  try {
    const destination = await Destination.create(req.body);

    await recordActivity({
      user: req.user,
      action: 'Created Destination',
      module: 'Destination',
      details: `${req.user ? req.user.name : 'Admin'} created destination "${destination.name}" (${destination.city})`,
      entityId: destination._id,
      metadata: { name: destination.name, city: destination.city }
    });

    res.status(201).json({ success: true, data: destination });
  } catch (error) {
    next(error);
  }
};

// @desc    Update destination (Admin only)
// @route   PUT /api/v1/destinations/:id
// @access  Private (Admin)
export const updateDestination = async (req, res, next) => {
  try {
    const destination = await Destination.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    await recordActivity({
      user: req.user,
      action: 'Updated Destination',
      module: 'Destination',
      details: `${req.user ? req.user.name : 'Admin'} updated destination "${destination.name}"`,
      entityId: destination._id,
      metadata: { name: destination.name }
    });

    res.json({ success: true, data: destination });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete destination (Admin only)
// @route   DELETE /api/v1/destinations/:id
// @access  Private (Admin)
export const deleteDestination = async (req, res, next) => {
  try {
    const destination = await Destination.findByIdAndDelete(req.params.id);
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    await recordActivity({
      user: req.user,
      action: 'Deleted Destination',
      module: 'Destination',
      details: `${req.user ? req.user.name : 'Admin'} deleted destination "${destination.name}"`,
      entityId: req.params.id,
      metadata: { name: destination.name }
    });

    res.json({ success: true, message: 'Destination deleted successfully' });
  } catch (error) {
    next(error);
  }
};
