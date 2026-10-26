import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    userName: {
      type: String,
      default: 'Guest / System'
    },
    userEmail: {
      type: String,
      default: ''
    },
    userRole: {
      type: String,
      default: 'Tourist'
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    module: {
      type: String,
      enum: [
        'Booking',
        'Itinerary',
        'Destination',
        'Hotel',
        'Experience',
        'Restaurant',
        'Transport',
        'User',
        'Review',
        'Community',
        'Emergency',
        'Loyalty',
        'System'
      ],
      default: 'System'
    },
    details: {
      type: String,
      default: ''
    },
    entityId: {
      type: String,
      default: ''
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ module: 1 });
activityLogSchema.index({ user: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;

export const recordActivity = async ({
  user,
  action,
  module,
  details = '',
  entityId = '',
  metadata = {}
}) => {
  try {
    const logData = {
      action,
      module,
      details,
      entityId: entityId ? String(entityId) : '',
      metadata
    };

    if (user) {
      logData.user = user._id || user.id || null;
      logData.userName = user.name || 'Anonymous User';
      logData.userEmail = user.email || '';
      logData.userRole = user.role || 'Tourist';
    }

    await ActivityLog.create(logData);
  } catch (err) {
    console.error('[ActivityLog] Failed to record user action:', err.message);
  }
};

