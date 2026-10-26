import EmergencyAlert from '../models/EmergencyAlert.js';
import { recordActivity } from '../models/ActivityLog.js';

// @desc    Trigger SOS Emergency Alert
// @route   POST /api/v1/emergency/sos
// @access  Private
export const triggerSOS = async (req, res, next) => {
  try {
    const { location, address, type, notes, phone } = req.body;
    if (!location) {
      return res.status(400).json({ success: false, message: 'Location is required for emergency dispatch' });
    }

    const alert = await EmergencyAlert.create({
      user: req.user._id,
      userName: req.user.name,
      userPhone: phone || req.user.phone || 'Not Provided',
      location,
      address: address || '',
      type: type || 'Medical',
      notes: notes || 'Urgent tourist emergency request',
      status: 'Active'
    });

    await recordActivity({
      user: req.user,
      action: 'Triggered SOS Emergency Alert',
      module: 'Emergency',
      details: `CRITICAL: ${req.user.name} triggered SOS (${type || 'Medical'}) at ${address || location}`,
      entityId: alert._id,
      metadata: { type: alert.type, location, address, phone: alert.userPhone }
    });

    res.status(201).json({
      success: true,
      message: 'Emergency assistance request saved. Use the prepared SMS or call a listed emergency number for immediate help.',
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Emergency Helpline Contacts & Facilities
// @route   GET /api/v1/emergency/contacts
// @access  Public
export const getHelplineContacts = async (req, res, next) => {
  try {
    const contacts = [
      { name: 'National Emergency Number', number: '112', type: 'Universal' },
      { name: 'Police Helpline', number: '100', type: 'Police' },
      { name: 'Ambulance & Medical Response', number: '108', type: 'Medical' },
      { name: 'Fire and Rescue', number: '101', type: 'Fire' },
      { name: 'Tourist Helpline (24x7 Multi-lingual)', number: '1363', type: 'Tourist' },
      { name: 'Women Helpline', number: '181', type: 'Safety' },
      { name: 'Women Safety Helpline', number: '1091', type: 'Safety' },
      { name: 'Disaster Management Response', number: '1078', type: 'Disaster' }
    ];

    res.json({
      success: true,
      data: {
        helplines: contacts,
        nearbyFacilities: []
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Emergency Alerts (For Admin & Support Executive)
// @route   GET /api/v1/emergency/alerts
// @access  Private (Admin / Support Executive)
export const getEmergencyAlerts = async (req, res, next) => {
  try {
    const alerts = await EmergencyAlert.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update SOS Alert Status
// @route   PUT /api/v1/emergency/alerts/:id
// @access  Private (Admin / Support Executive)
export const updateAlertStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const alert = await EmergencyAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Emergency alert not found' });
    }

    if (status) alert.status = status;
    if (notes) alert.notes = notes;

    await alert.save();

    res.json({
      success: true,
      message: `Emergency alert updated to ${alert.status}`,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};
