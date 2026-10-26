import Transport from '../models/Transport.js';
import { recordActivity } from '../models/ActivityLog.js';

// @desc    Get transport options
// @route   GET /api/v1/transport
// @access  Public
export const getTransports = async (req, res, next) => {
  try {
    const { type, city, search, maxPrice } = req.query;
    const query = {};

    if (type) query.type = type;
    if (city) query.city = { $regex: city, $options: 'i' };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { vehicleModel: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }
    if (maxPrice) query.pricePerDay = { $lte: Number(maxPrice) };

    const transports = await Transport.find(query).populate('provider', 'name email phone');
    res.json({ success: true, count: transports.length, data: transports });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transport details
// @route   GET /api/v1/transport/:id
// @access  Public
export const getTransportById = async (req, res, next) => {
  try {
    const transport = await Transport.findById(req.params.id).populate('provider', 'name email phone');
    if (!transport) {
      return res.status(404).json({ success: false, message: 'Transport option not found' });
    }
    res.json({ success: true, data: transport });
  } catch (error) {
    next(error);
  }
};

// @desc    Create transport listing
// @route   POST /api/v1/transport
// @access  Private (Transport Provider / Admin)
export const createTransport = async (req, res, next) => {
  try {
    const transport = await Transport.create({
      ...req.body,
      provider: req.user._id
    });

    await recordActivity({
      user: req.user,
      action: 'Created Transport Listing',
      module: 'Transport',
      details: `${req.user.name} listed transport: ${transport.vehicleModel || transport.title} (${transport.type})`,
      entityId: transport._id,
      metadata: { type: transport.type, city: transport.city }
    });

    res.status(201).json({ success: true, data: transport });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transport listing
// @route   PUT /api/v1/transport/:id
// @access  Private
export const updateTransport = async (req, res, next) => {
  try {
    let transport = await Transport.findById(req.params.id);
    if (!transport) {
      return res.status(404).json({ success: false, message: 'Transport option not found' });
    }

    if (transport.provider && transport.provider.toString() !== req.user._id.toString() && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this transport listing' });
    }

    transport = await Transport.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    await recordActivity({
      user: req.user,
      action: 'Updated Transport Listing',
      module: 'Transport',
      details: `${req.user.name} updated transport: ${transport.vehicleModel || transport.title}`,
      entityId: transport._id,
      metadata: { type: transport.type }
    });

    res.json({ success: true, data: transport });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transport listing
// @route   DELETE /api/v1/transport/:id
// @access  Private
export const deleteTransport = async (req, res, next) => {
  try {
    const transport = await Transport.findById(req.params.id);
    if (!transport) {
      return res.status(404).json({ success: false, message: 'Transport option not found' });
    }

    if (transport.provider && transport.provider.toString() !== req.user._id.toString() && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this transport listing' });
    }

    await Transport.findByIdAndDelete(req.params.id);

    await recordActivity({
      user: req.user,
      action: 'Deleted Transport Listing',
      module: 'Transport',
      details: `${req.user.name} deleted transport: ${transport.vehicleModel || transport.title}`,
      entityId: req.params.id,
      metadata: { type: transport.type }
    });

    res.json({ success: true, message: 'Transport listing deleted successfully' });
  } catch (error) {
    next(error);
  }
};
