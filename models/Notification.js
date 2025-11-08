const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'announcement', 'assignment', 'exam', 'fee', 'attendance'],
    default: 'info'
  },
  recipients: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    }
  }],
  relatedTo: {
    type: {
      type: String,
      enum: ['assignment', 'exam', 'fee', 'attendance', 'result', 'other'],
      default: 'other'
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedTo.type'
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  actionUrl: {
    type: String,
    trim: true
  },
  expiresAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for faster querying
notificationSchema.index({ 'recipients.user': 1, 'recipients.read': 1 });
notificationSchema.index({ 'relatedTo.type': 1, 'relatedTo.id': 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to create a notification
notificationSchema.statics.createNotification = async function(notificationData) {
  const { title, message, type, recipients, relatedTo, priority, actionUrl, expiresAt, createdBy } = notificationData;
  
  const notification = new this({
    title,
    message,
    type,
    recipients: recipients.map(recipient => ({
      user: recipient,
      read: false
    })),
    relatedTo,
    priority,
    actionUrl,
    expiresAt,
    createdBy,
    isActive: true
  });
  
  return notification.save();
};

// Method to mark notification as read
notificationSchema.methods.markAsRead = async function(userId) {
  const recipientIndex = this.recipients.findIndex(
    r => r.user.toString() === userId.toString()
  );
  
  if (recipientIndex >= 0 && !this.recipients[recipientIndex].read) {
    this.recipients[recipientIndex].read = true;
    this.recipients[recipientIndex].readAt = new Date();
    await this.save();
  }
  
  return this;
};

// Static method to get unread notifications count for a user
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({
    'recipients.user': userId,
    'recipients.read': false,
    isActive: true,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  });
};

// Static method to get notifications for a user
notificationSchema.statics.getUserNotifications = async function(userId, { limit = 10, page = 1, unreadOnly = false, type = null } = {}) {
  const query = {
    'recipients.user': userId,
    isActive: true,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  };
  
  if (unreadOnly) {
    query['recipients.read'] = false;
  }
  
  if (type) {
    query.type = type;
  }
  
  const options = {
    sort: { createdAt: -1 },
    skip: (page - 1) * limit,
    limit: parseInt(limit)
  };
  
  return this.find(query, null, options)
    .populate('createdBy', 'firstName lastName')
    .populate('relatedTo.id')
    .lean()
    .then(notifications => {
      // Filter to only include the recipient's data
      return notifications.map(notification => {
        const recipientData = notification.recipients.find(
          r => r.user.toString() === userId.toString()
        );
        
        return {
          ...notification,
          read: recipientData.read,
          readAt: recipientData.readAt
        };
      });
    });
};

module.exports = mongoose.model('Notification', notificationSchema);
