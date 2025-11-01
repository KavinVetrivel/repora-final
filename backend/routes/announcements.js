const express = require('express');
const { body, validationResult } = require('express-validator');
const Announcement = require('../models/Announcement');
const User = require('../models/User');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// @route   POST /api/announcements
// @desc    Create a new announcement (admin only)
// @access  Private (Admin)
router.post('/', authenticateToken, requireAdmin, upload.array('attachments', 5), [
  body('title')
    .trim()
    .isLength({ min: 5, max: 150 })
    .withMessage('Title must be between 5 and 150 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Content must be between 10 and 2000 characters'),
  body('category')
    .optional()
    .isIn(['general', 'academic', 'events', 'exam', 'holiday', 'important'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
  body('targetAudience')
    .optional()
    .isIn(['all', 'students', 'specific-classes'])
    .withMessage('Invalid target audience'),
  body('targetClasses')
    .optional()
    .isArray()
    .withMessage('Target classes must be an array'),
  body('targetClasses.*.year')
    .optional()
    .isIn(['1st', '2nd', '3rd', '4th', '5th'])
    .withMessage('Invalid target year'),
  body('targetClasses.*.department')
    .optional()
    .isIn(['Computer Science', 'Mechanical Engineering', 'Information Technology', 'Civil Engineering'])
    .withMessage('Invalid department'),
  body('targetClasses.*.className')
    .optional()
    .isString()
    .withMessage('Invalid class name'),
  body('isPinned')
    .optional()
    .isBoolean()
    .withMessage('isPinned must be a boolean'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid expiry date')
], async (req, res) => {
  try {
    // Debug: Log the incoming request body
    console.log('📝 Announcement creation request:', JSON.stringify(req.body, null, 2));
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      title, 
      content, 
      category = 'general', 
      priority = 'medium',
      targetAudience = 'all',
      targetClasses,
      isPinned = false,
      expiryDate
    } = req.body;

    // Basic validation only for now
    console.log('📋 Target audience:', targetAudience);
    console.log('📋 Target classes:', targetClasses);

    // Process uploaded files
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push({
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: file.path
        });
      });
    }

    // Create new announcement
    const announcementData = {
      title,
      content,
      category,
      priority,
      targetAudience,
      targetClasses: targetAudience === 'specific-classes' ? targetClasses : [],
      isPinned,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      createdBy: req.user._id,
      attachments
    };
    
    console.log('📝 Creating announcement with data:', JSON.stringify(announcementData, null, 2));
    
    const announcement = new Announcement(announcementData);

    await announcement.save();
    console.log('✅ Announcement saved successfully');

    await announcement.populate('createdBy', 'name email');

    res.status(201).json({
      status: 'success',
      message: 'Announcement created successfully',
      data: {
        announcement
      }
    });

  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create announcement',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}, handleUploadError);

// @route   GET /api/announcements
// @desc    Get announcements (public with optional auth for personalized content)
// @access  Public (with optional auth)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      priority, 
      isPinned,
      sortBy = 'publishDate',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    // Filter out expired announcements
    query.$or = [
      { expiryDate: { $exists: false } },
      { expiryDate: null },
      { expiryDate: { $gt: new Date() } }
    ];

    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (isPinned !== undefined) query.isPinned = isPinned === 'true';

    // Filter by target audience if user is authenticated
    if (req.user) {
      if (req.user.role === 'student' || req.user.role === 'class-representative') {
        // Students and class representatives see announcements targeted to them
        const studentQuery = {
          $or: [
            { targetAudience: 'all' },
            { targetAudience: 'students' },
            { 
              targetAudience: 'specific-classes',
              targetClasses: {
                $elemMatch: {
                  year: req.user.year,
                  department: req.user.department,
                  className: req.user.className
                }
              }
            }
          ]
        };
        Object.assign(query, studentQuery);
      }
      // Admins see all announcements
    } else {
      // Non-authenticated users see only general announcements
      query.targetAudience = 'all';
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const announcements = await Announcement.find(query)
      .sort({ isPinned: -1, ...sortOptions }) // Pinned announcements first
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name email')
      .lean();

    const total = await Announcement.countDocuments(query);

    // Track view for authenticated users
    if (req.user && announcements.length > 0) {
      const announcementIds = announcements.map(a => a._id);
      await Announcement.updateMany(
        { _id: { $in: announcementIds } },
        { $addToSet: { viewedBy: { user: req.user._id, viewedAt: new Date() } } }
      );
    }

    res.json({
      status: 'success',
      data: {
        announcements,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get announcements'
    });
  }
});

// @route   GET /api/announcements/all
// @desc    Get all announcements for admin management
// @access  Private (Admin)
router.get('/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      priority, 
      targetAudience,
      isActive,
      sortBy = 'publishDate',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (targetAudience) query.targetAudience = targetAudience;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const announcements = await Announcement.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name email')
      .lean();

    const total = await Announcement.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        announcements,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get all announcements error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get announcements'
    });
  }
});

// @route   GET /api/announcements/:id
// @desc    Get a specific announcement
// @access  Public (with optional auth)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id)
      .populate('createdBy', 'name email');

    if (!announcement) {
      return res.status(404).json({
        status: 'error',
        message: 'Announcement not found'
      });
    }

    // Check if announcement is active and not expired
    if (!announcement.isActive || announcement.isExpired()) {
      return res.status(404).json({
        status: 'error',
        message: 'Announcement not available'
      });
    }

    // Track view for authenticated users
    if (req.user) {
      await announcement.incrementView(req.user._id);
    }

    res.json({
      status: 'success',
      data: {
        announcement
      }
    });

  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get announcement'
    });
  }
});

// @route   PUT /api/announcements/:id
// @desc    Update an announcement
// @access  Private (Admin)
router.put('/:id', authenticateToken, requireAdmin, upload.array('attachments', 5), [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 150 })
    .withMessage('Title must be between 5 and 150 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Content must be between 10 and 2000 characters'),
  body('category')
    .optional()
    .isIn(['general', 'academic', 'events', 'exam', 'holiday', 'important'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
  body('targetAudience')
    .optional()
    .isIn(['all', 'students', 'specific-classes'])
    .withMessage('Invalid target audience'),
  body('isPinned')
    .optional()
    .isBoolean()
    .withMessage('isPinned must be a boolean'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = {};

    // Only include fields that are provided
    const allowedFields = ['title', 'content', 'category', 'priority', 'targetAudience', 'isPinned', 'isActive'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Process new attachments if any
    if (req.files && req.files.length > 0) {
      const attachments = [];
      req.files.forEach(file => {
        attachments.push({
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: file.path
        });
      });
      updateData.attachments = attachments;
    }

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!announcement) {
      return res.status(404).json({
        status: 'error',
        message: 'Announcement not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Announcement updated successfully',
      data: {
        announcement
      }
    });

  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update announcement'
    });
  }
}, handleUploadError);

// @route   DELETE /api/announcements/:id
// @desc    Delete an announcement
// @access  Private (Admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      return res.status(404).json({
        status: 'error',
        message: 'Announcement not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Announcement deleted successfully'
    });

  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete announcement'
    });
  }
});

// @route   PATCH /api/announcements/:id/toggle-pin
// @desc    Toggle pin status of an announcement
// @access  Private (Admin)
router.patch('/:id/toggle-pin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        status: 'error',
        message: 'Announcement not found'
      });
    }

    announcement.isPinned = !announcement.isPinned;
    await announcement.save();

    await announcement.populate('createdBy', 'name email');

    res.json({
      status: 'success',
      message: `Announcement ${announcement.isPinned ? 'pinned' : 'unpinned'} successfully`,
      data: {
        announcement
      }
    });

  } catch (error) {
    console.error('Toggle pin error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to toggle pin status'
    });
  }
});

// @route   GET /api/announcements/stats/summary
// @desc    Get announcement statistics summary
// @access  Private (Admin)
router.get('/stats/summary', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await Announcement.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Announcement.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const audienceStats = await Announcement.aggregate([
      {
        $group: {
          _id: '$targetAudience',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalViews = await Announcement.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' }
        }
      }
    ]);

    res.json({
      status: 'success',
      data: {
        categoryStats: stats,
        priorityStats,
        audienceStats,
        totalViews: totalViews[0]?.totalViews || 0
      }
    });

  } catch (error) {
    console.error('Get announcement stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get announcement statistics'
    });
  }
});

module.exports = router;

