import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import { recordActivity } from '../models/ActivityLog.js';

// @desc    Get all hotels with search, city & price filters
// @route   GET /api/v1/hotels
// @access  Public
export const getHotels = async (req, res, next) => {
  try {
    const { destinationId, city, search, minPrice, maxPrice, amenity } = req.query;
    const query = {};

    if (destinationId) query.destination = destinationId;
    if (city) query.city = { $regex: city, $options: 'i' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (minPrice || maxPrice) {
      query.startingPrice = {};
      if (minPrice) query.startingPrice.$gte = Number(minPrice);
      if (maxPrice) query.startingPrice.$lte = Number(maxPrice);
    }
    if (amenity) {
      query.amenities = amenity;
    }

    const hotels = await Hotel.find(query).populate('destination', 'name city country');
    res.json({ success: true, count: hotels.length, data: hotels });
  } catch (error) {
    next(error);
  }
};

// @desc    Get hotel details with rooms
// @route   GET /api/v1/hotels/:id
// @access  Public
export const getHotelById = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate('destination', 'name city country description')
      .populate('owner', 'name email phone');

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const rooms = await Room.find({ hotel: hotel._id });

    res.json({
      success: true,
      data: {
        ...hotel.toObject(),
        rooms
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create hotel listing (Hotel Owner / Admin)
// @route   POST /api/v1/hotels
// @access  Private
export const createHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.create({
      ...req.body,
      owner: req.user._id
    });

    await recordActivity({
      user: req.user,
      action: 'Created Hotel',
      module: 'Hotel',
      details: `${req.user.name} created hotel "${hotel.name}" in ${hotel.city || 'unspecified'}`,
      entityId: hotel._id,
      metadata: { hotelName: hotel.name, city: hotel.city }
    });

    res.status(201).json({ success: true, data: hotel });
  } catch (error) {
    next(error);
  }
};

// @desc    Update hotel (Hotel Owner / Admin)
// @route   PUT /api/v1/hotels/:id
// @access  Private
export const updateHotel = async (req, res, next) => {
  try {
    let hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    if (hotel.owner && hotel.owner.toString() !== req.user._id.toString() && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this hotel' });
    }

    hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    // If startingPrice is updated, also update any rooms associated with this hotel so room rates stay synchronized
    if (req.body.startingPrice) {
      await Room.updateMany(
        { hotel: hotel._id },
        { pricePerNight: Number(req.body.startingPrice) }
      );
    }

    await recordActivity({
      user: req.user,
      action: 'Updated Hotel',
      module: 'Hotel',
      details: `${req.user.name} updated hotel "${hotel.name}"`,
      entityId: hotel._id,
      metadata: { hotelName: hotel.name }
    });

    res.json({ success: true, data: hotel });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete hotel (Hotel Owner / Admin)
// @route   DELETE /api/v1/hotels/:id
// @access  Private
export const deleteHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    if (hotel.owner && hotel.owner.toString() !== req.user._id.toString() && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this hotel' });
    }

    await Room.deleteMany({ hotel: hotel._id });
    await Hotel.findByIdAndDelete(req.params.id);

    await recordActivity({
      user: req.user,
      action: 'Deleted Hotel',
      module: 'Hotel',
      details: `${req.user.name} deleted hotel "${hotel.name}" and its rooms`,
      entityId: req.params.id,
      metadata: { hotelName: hotel.name }
    });

    res.json({ success: true, message: 'Hotel and associated rooms deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add room to hotel
// @route   POST /api/v1/hotels/:hotelId/rooms
// @access  Private (Hotel Owner / Admin)
export const addRoomToHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const room = await Room.create({
      ...req.body,
      hotel: hotel._id
    });

    // Update hotel starting price if this room is cheaper
    if (!hotel.startingPrice || room.pricePerNight < hotel.startingPrice) {
      hotel.startingPrice = room.pricePerNight;
      await hotel.save();
    }

    await recordActivity({
      user: req.user,
      action: 'Added Room to Hotel',
      module: 'Hotel',
      details: `${req.user.name} added room "${room.roomType || room.title}" to hotel "${hotel.name}"`,
      entityId: room._id,
      metadata: { hotelId: hotel._id, roomType: room.roomType }
    });

    res.status(201).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};
