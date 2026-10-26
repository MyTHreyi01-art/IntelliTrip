import Booking from '../models/Booking.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Transport from '../models/Transport.js';
import Experience from '../models/Experience.js';
import Restaurant from '../models/Restaurant.js';
import Destination from '../models/Destination.js';
import { sendBookingConfirmationEmail } from '../services/emailService.js';
import { recordActivity } from '../models/ActivityLog.js';

// @desc    Create new booking
// @route   POST /api/v1/bookings
// @access  Private (Tourist / Logged in users)
export const createBooking = async (req, res, next) => {
  try {
    const {
      itemType,
      itemRef,
      roomId,
      startDate,
      endDate,
      reservationTime,
      contactPhone,
      fullName,
      email,
      guests,
      specialRequests
    } = req.body;

    if (!itemType || !itemRef || !startDate) {
      return res.status(400).json({ success: false, message: 'Please provide itemType, itemRef, and startDate' });
    }

    let calculatedPrice = 0;
    let targetItem = null;
    let itemTitle = 'Tourism Service';
    let itemLocation = '';

    // Standardize all rates to Indian Rupees (INR)
    const toInr = (val) => (Number(val) < 1000 ? Math.round(Number(val) * 80) : Number(val));

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(startDate);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1);

    if (itemType === 'Hotel') {
      targetItem = await Hotel.findById(itemRef);
      if (!targetItem) return res.status(404).json({ success: false, message: 'Hotel not found' });
      itemTitle = targetItem.name;
      itemLocation = targetItem.city || targetItem.address || '';

      if (roomId) {
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ success: false, message: 'Room type not found' });
        calculatedPrice = toInr(room.pricePerNight) * days;
        itemTitle = `${targetItem.name} - ${room.roomType || room.title}`;
      } else {
        calculatedPrice = toInr(targetItem.startingPrice) * days * (Number(guests) || 1);
      }
    } else if (itemType === 'Transport') {
      targetItem = await Transport.findById(itemRef);
      if (!targetItem) return res.status(404).json({ success: false, message: 'Transport not found' });

      calculatedPrice = toInr(targetItem.pricePerDay) * days;
      itemTitle = `${targetItem.vehicleModel || targetItem.title} (${targetItem.type})`;
      itemLocation = targetItem.city || targetItem.pickupLocation || '';
    } else if (itemType === 'Experience') {
      targetItem = await Experience.findById(itemRef).populate('destination');
      if (!targetItem) return res.status(404).json({ success: false, message: 'Experience not found' });

      calculatedPrice = toInr(targetItem.pricePerPerson) * days * (Number(guests) || 1);
      itemTitle = targetItem.title;
      itemLocation = targetItem.destination?.city || targetItem.destination?.name || '';
    } else if (itemType === 'Restaurant') {
      targetItem = await Restaurant.findById(itemRef);
      if (!targetItem) return res.status(404).json({ success: false, message: 'Restaurant not found' });
      if (!reservationTime) return res.status(400).json({ success: false, message: 'Reservation time is required' });
      calculatedPrice = Math.round((targetItem.averagePriceForTwo || 1800) * (Number(guests || 2) / 2));
      itemTitle = targetItem.name;
      itemLocation = targetItem.address || targetItem.city || '';
    } else if (itemType === 'Destination') {
      targetItem = await Destination.findById(itemRef);
      if (!targetItem) return res.status(404).json({ success: false, message: 'Destination not found' });

      calculatedPrice = toInr(targetItem.averageCostPerDay || 50) * days * (Number(guests) || 1);
      itemTitle = `${targetItem.name} Bespoke Tour Package`;
      itemLocation = `${targetItem.city}, ${targetItem.country || 'India'}`;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid itemType. Must be Hotel, Transport, Experience, Restaurant, or Destination' });
    }

    const booking = await Booking.create({
      user: req.user._id,
      fullName: fullName || req.user.name || '',
      email: email || req.user.email || '',
      itemType,
      itemRef,
      itemModel: itemType,
      room: roomId || null,
      startDate,
      endDate: endDate || startDate,
      reservationTime: reservationTime || '',
      contactPhone: contactPhone || req.user.phone || '',
      guests: Number(guests) || 1,
      totalPrice: calculatedPrice,
      currency: 'INR',
      status: 'Confirmed',
      paymentStatus: 'Pending',
      specialRequests: specialRequests || '',
      emailConfirmationSent: false
    });

    // Send email confirmation to user's registered email
    const registeredEmail = req.user.email;
    const recipientName = fullName || req.user.name || 'Valued Traveler';

    let emailResult = { sent: false };
    try {
      emailResult = await sendBookingConfirmationEmail({
        recipientEmail: registeredEmail,
        recipientName,
        booking,
        itemTitle,
        itemLocation,
        itemType,
        specialRequests
      });

      if (emailResult.sent) {
        booking.emailConfirmationSent = true;
        await booking.save();
      }
    } catch (mailErr) {
      console.error('[BookingController] Email notification error:', mailErr.message);
      emailResult = { sent: false, error: mailErr.message };
    }

    await recordActivity({
      user: req.user,
      action: 'Created Booking',
      module: 'Booking',
      details: `${recipientName} booked ${itemTitle} (${itemType}) for ₹${calculatedPrice.toLocaleString()}`,
      entityId: booking._id,
      metadata: {
        itemType,
        itemTitle,
        itemLocation,
        totalPrice: calculatedPrice,
        startDate,
        endDate
      }
    });

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully! A confirmation email has been sent to your registered email.',
      data: booking,
      emailConfirmation: {
        sent: emailResult.sent,
        recipient: registeredEmail,
        previewUrl: emailResult.previewUrl || null
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Super Admin & Tourism Admin)
// @route   GET /api/v1/bookings
// @access  Private (Super Admin / Tourism Department Admin)
export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email phone role')
      .populate({
        path: 'itemRef',
        options: { strictPopulate: false },
        populate: {
          path: 'destination',
          select: 'name city attractions images',
          options: { strictPopulate: false }
        }
      })
      .populate('room')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's personal bookings
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id, status: { $ne: 'Cancelled' } })
      .populate({
        path: 'itemRef',
        options: { strictPopulate: false },
        populate: {
          path: 'destination',
          select: 'name city attractions images',
          options: { strictPopulate: false }
        }
      })
      .populate('room')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking details
// @route   GET /api/v1/bookings/:id
// @access  Private
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate({ path: 'itemRef', options: { strictPopulate: false } })
      .populate('room');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking (removes trip data)
// @route   PATCH /api/v1/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check authorization: owner of booking or admin
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    // Permanently remove the cancelled booking data as requested
    await Booking.findByIdAndDelete(req.params.id);

    await recordActivity({
      user: req.user,
      action: 'Cancelled Booking',
      module: 'Booking',
      details: `${req.user.name} cancelled reservation for ${booking.itemType} (Booking #${booking._id})`,
      entityId: req.params.id,
      metadata: { itemType: booking.itemType, totalPrice: booking.totalPrice }
    });

    res.json({
      success: true,
      message: 'Trip reservation cancelled and removed successfully',
      data: { _id: req.params.id }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete booking directly
// @route   DELETE /api/v1/bookings/:id
// @access  Private
export const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this booking' });
    }

    await Booking.findByIdAndDelete(req.params.id);

    await recordActivity({
      user: req.user,
      action: 'Deleted Booking',
      module: 'Booking',
      details: `${req.user.name} permanently removed booking record #${booking._id}`,
      entityId: req.params.id,
      metadata: { itemType: booking.itemType, totalPrice: booking.totalPrice }
    });

    res.json({
      success: true,
      message: 'Booking removed successfully',
      data: { _id: req.params.id }
    });
  } catch (error) {
    next(error);
  }
};
