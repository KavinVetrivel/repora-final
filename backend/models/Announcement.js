const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  content: {
    type: String,
    required: [true, 'Announcement content is required'],
    trim: true,
    minlength: [10, 'Content must be at least 10 characters'],
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  category: {
    type: String,
    enum: ['general', 'academic', 'events', 'exam', 'holiday', 'important'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'specific-year', 'specific-department'],
    default: 'all'
  },
  targetYear: {
    type: String,
    enum: ['1st', '2nd', '3rd', '4th', '5th'],
    required: function() {
      return this.targetAudience === 'specific-year';
    }
  },
  targetDepartment: {
    type: String,
    trim: true,
    required: function() {
      return this.targetAudience === 'specific-department';
    }
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > this.publishDate;
      },
      message: 'Expiry date must be after publish date'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    path: {
      type: String,
      required: true
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  viewedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better performance
announcementSchema.index({ publishDate: -1, isPinned: -1 });
announcementSchema.index({ category: 1, priority: 1 });
announcementSchema.index({ targetAudience: 1, targetYear: 1, targetDepartment: 1 });
announcementSchema.index({ isActive: 1, publishDate: -1 });

// Virtual for time since publish
announcementSchema.virtual('timeSincePublish').get(function() {
  const now = new Date();
  const diff = now - this.publishDate;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
});

// Method to check if announcement is expired
announcementSchema.methods.isExpired = function() {
  return this.expiryDate && new Date() > this.expiryDate;
};

// Method to increment view count
announcementSchema.methods.incrementView = function(userId) {
  // Check if user has already viewed
  const hasViewed = this.viewedBy.some(view => 
    view.user.toString() === userId.toString()
  );
  
  if (!hasViewed) {
    this.viewedBy.push({ user: userId });
    this.views += 1;
    return this.save();
  }
  
  return Promise.resolve(this);
};

module.exports = mongoose.model('Announcement', announcementSchema);
