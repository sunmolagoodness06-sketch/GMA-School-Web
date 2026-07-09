import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  body: {
    type: String,
    required: true,
    maxLength: 5000
  },
  summary: {
    type: String,
    maxLength: 300
  },
  category: {
    type: String,
    enum: ['general', 'academic', 'fees', 'events', 'holidays', 'emergency', 'maintenance', 'exam', 'admission'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  targetAudience: {
    divisions: [{
      type: String,
      enum: ['nursery', 'primary', 'secondary', 'college', 'all']
    }],
    classes: [String], // Specific classes if not all
    roles: [{
      type: String,
      enum: ['student', 'parent', 'staff', 'admin', 'all']
    }]
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  attachments: [{
    fileName: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      enum: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'other']
    },
    fileSize: Number
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  acknowledgmentRequired: {
    type: Boolean,
    default: false
  },
  acknowledgedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledgedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    tags: [String],
    relatedEvent: String,
    reminderDate: Date
  }
}, {
  timestamps: true
});

// Indexes for performance
noticeSchema.index({ publishDate: -1 });
noticeSchema.index({ expiryDate: 1 });
noticeSchema.index({ category: 1 });
noticeSchema.index({ priority: 1 });
noticeSchema.index({ isPublished: 1, isActive: 1 });
noticeSchema.index({ 'targetAudience.divisions': 1 });
noticeSchema.index({ 'targetAudience.roles': 1 });
noticeSchema.index({ isPinned: 1 });

// Text search index
noticeSchema.index({
  title: 'text',
  body: 'text',
  'metadata.tags': 'text'
});

// Virtual for active status
noticeSchema.virtual('isExpired').get(function() {
  return this.expiryDate < new Date();
});

// Virtual for days remaining
noticeSchema.virtual('daysRemaining').get(function() {
  const today = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Static method to find active notices for a user
noticeSchema.statics.findForUser = function(userRole, userDivision = null) {
  const now = new Date();
  const query = {
    isPublished: true,
    isActive: true,
    publishDate: { $lte: now },
    expiryDate: { $gte: now },
    $or: [
      { 'targetAudience.roles': 'all' },
      { 'targetAudience.roles': userRole }
    ]
  };

  if (userDivision && userRole !== 'admin') {
    query.$or.push(
      { 'targetAudience.divisions': 'all' },
      { 'targetAudience.divisions': userDivision }
    );
  }

  return this.find(query).sort({ isPinned: -1, priority: -1, publishDate: -1 });
};

// Static method to find notices by category
noticeSchema.statics.findByCategory = function(category, isActive = true) {
  const query = { category, isActive };
  return this.find(query).sort({ publishDate: -1 });
};

// Static method to find urgent notices
noticeSchema.statics.findUrgent = function() {
  const now = new Date();
  return this.find({
    priority: 'urgent',
    isPublished: true,
    isActive: true,
    publishDate: { $lte: now },
    expiryDate: { $gte: now }
  }).sort({ publishDate: -1 });
};

// Method to mark as read by user
noticeSchema.methods.markAsRead = function(userId) {
  const alreadyRead = this.readBy.some(read => read.user.toString() === userId.toString());
  
  if (!alreadyRead) {
    this.readBy.push({ user: userId });
    this.viewCount += 1;
  }
  
  return this.save();
};

// Method to acknowledge notice
noticeSchema.methods.acknowledge = function(userId) {
  const alreadyAcknowledged = this.acknowledgedBy.some(ack => ack.user.toString() === userId.toString());
  
  if (!alreadyAcknowledged && this.acknowledgmentRequired) {
    this.acknowledgedBy.push({ user: userId });
  }
  
  return this.save();
};

// Method to check if user has read notice
noticeSchema.methods.hasUserRead = function(userId) {
  return this.readBy.some(read => read.user.toString() === userId.toString());
};

// Method to check if user has acknowledged notice
noticeSchema.methods.hasUserAcknowledged = function(userId) {
  return this.acknowledgedBy.some(ack => ack.user.toString() === userId.toString());
};

export default mongoose.model('Notice', noticeSchema);