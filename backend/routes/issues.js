const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Issue = require('../models/Issue');
const { authenticateToken, requireAdmin, requireStudent, requireStudentOrClassRep, checkResourceAccess } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

const getAdminIssues = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      priority,
      studentRollNumber,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (studentRollNumber) {
      query.studentRollNumber = studentRollNumber.toUpperCase();
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const issues = await Issue.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('studentId', 'name email department year')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name email')
      .populate('processedBy', 'name email')
      .lean();

    const total = await Issue.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        issues,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get all issues error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get issues'
    });
  }
};

const updateIssueStatus = async (req, res, { status: forcedStatus, extraUpdates = {} } = {}) => {
  try {
    const { id } = req.params;
    const status = forcedStatus || req.body.status;
    const adminNotes = req.body?.adminNotes;
    const assignedTo = req.body?.assignedTo ?? extraUpdates.assignedTo;

    if (!['pending', 'open', 'in-progress', 'resolved', 'closed', 'rejected'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status'
      });
    }

    if (adminNotes && adminNotes.length > 500) {
      return res.status(400).json({
        status: 'error',
        message: 'Admin notes cannot exceed 500 characters'
      });
    }

    if (assignedTo && !mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid assigned user ID'
      });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        status: 'error',
        message: 'Issue not found'
      });
    }

    const previousStatus = issue.status;
    issue.status = status;
    if (adminNotes) issue.adminNotes = adminNotes;
    if (assignedTo) {
      issue.assignedTo = assignedTo;
    }

    if (status === 'resolved' && previousStatus !== 'resolved') {
      issue.resolvedAt = new Date();
      issue.resolvedBy = req.user._id;
    }

    if (status === 'rejected') {
      issue.resolvedAt = new Date();
      issue.resolvedBy = req.user._id;
    }

    // Track when issue is processed from pending status
    if (issue.status === 'pending' && status !== 'pending') {
      issue.processedBy = req.user._id;
      issue.processedAt = new Date();
    }

    Object.assign(issue, extraUpdates);

    await issue.save();

    await issue.populate('studentId', 'name email');
    await issue.populate('assignedTo', 'name email');
    await issue.populate('resolvedBy', 'name email');
    await issue.populate('processedBy', 'name email');

    res.json({
      status: 'success',
      message: 'Issue status updated successfully',
      data: {
        issue
      }
    });

  } catch (error) {
    console.error('Update issue status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update issue status'
    });
  }
};

// @route   POST /api/issues
// @desc    Create a new issue (students only)
// @access  Private (Students)
router.post('/', authenticateToken, requireStudentOrClassRep, upload.array('attachments', 5), [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('category')
    .optional()
    .isIn(['academic', 'infrastructure', 'hostel', 'canteen', 'transport', 'other'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('room.id')
    .trim()
    .notEmpty()
    .withMessage('Room ID is required'),
  body('room.name')
    .trim()
    .notEmpty()
    .withMessage('Room name is required'),
  body('affectedComponents')
    .isArray({ min: 1 })
    .withMessage('At least one affected component must be selected'),
  body('affectedComponents.*.id')
    .trim()
    .notEmpty()
    .withMessage('Component ID is required'),
  body('affectedComponents.*.name')
    .trim()
    .notEmpty()
    .withMessage('Component name is required')
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

    const { title, description, category = 'other', priority = 'medium', room, affectedComponents } = req.body;

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

    // Create new issue
    const issue = new Issue({
      studentId: req.user._id,
      studentRollNumber: req.user.rollNumber,
      studentName: req.user.name,
      title,
      description,
      category,
      priority,
      room,
      affectedComponents,
      attachments
    });

    await issue.save();

    res.status(201).json({
      status: 'success',
      message: 'Issue created successfully',
      data: {
        issue
      }
    });

  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create issue',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}, handleUploadError);

// @route   GET /api/issues/student/:studentId
// @desc    Get issues for a specific student
// @access  Private (Student owner or Admin)
router.get('/student/:studentId', authenticateToken, checkResourceAccess('studentId'), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 10, status, category, priority } = req.query;

    const query = { studentId };
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const issues = await Issue.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name email')
      .populate('processedBy', 'name email')
      .lean();

    const total = await Issue.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        issues,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get student issues error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get issues'
    });
  }
});

// @route   GET /api/issues/my-issues
// @desc    Get current user's issues
// @access  Private (Students)
router.get('/my-issues', authenticateToken, requireStudentOrClassRep, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, priority } = req.query;

    const query = { studentId: req.user._id };
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const issues = await Issue.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name email')
      .populate('processedBy', 'name email')
      .lean();

    const total = await Issue.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        issues,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get my issues error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get issues'
    });
  }
});

// @route   GET /api/issues/all
// @desc    Get all issues (admin only)
// @access  Private (Admin)
router.get('/', authenticateToken, requireAdmin, getAdminIssues);

router.get('/all', authenticateToken, requireAdmin, getAdminIssues);

// @route   PATCH /api/issues/:id/status
// @desc    Update issue status (admin only)
// @access  Private (Admin)
router.patch('/:id/status', authenticateToken, requireAdmin, [
  body('status')
    .isIn(['pending', 'open', 'in-progress', 'resolved', 'closed', 'rejected'])
    .withMessage('Invalid status'),
  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Admin notes cannot exceed 500 characters'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid assigned user ID')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  return updateIssueStatus(req, res);
});

router.patch('/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  return updateIssueStatus(req, res, { status: 'open' });
});

router.patch('/:id/resolve', authenticateToken, requireAdmin, async (req, res) => {
  return updateIssueStatus(req, res, { status: 'resolved' });
});

router.patch('/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  return updateIssueStatus(req, res, { status: 'rejected' });
});

// @route   GET /api/issues/:id
// @desc    Get a specific issue
// @access  Private (Student owner or Admin)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await Issue.findById(id)
      .populate('studentId', 'name email department year')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name email')
      .populate('processedBy', 'name email');

    if (!issue) {
      return res.status(404).json({
        status: 'error',
        message: 'Issue not found'
      });
    }

    // Check if user can view this issue
    const canView = req.user.role === 'admin' || 
                   issue.studentId._id.toString() === req.user._id.toString();

    if (!canView) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied - insufficient permissions'
      });
    }

    res.json({
      status: 'success',
      data: {
        issue
      }
    });

  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get issue'
    });
  }
});

// @route   DELETE /api/issues/:id
// @desc    Delete an issue
// @access  Private (Student owner or Admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        status: 'error',
        message: 'Issue not found'
      });
    }

    // Check if user can delete this issue
    const canDelete = req.user.role === 'admin' || 
                     issue.studentId.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied - insufficient permissions'
      });
    }

    // Students can only delete pending issues
    if (req.user.role === 'student' && issue.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete issues that are not pending'
      });
    }

    await Issue.findByIdAndDelete(id);

    res.json({
      status: 'success',
      message: 'Issue deleted successfully'
    });

  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete issue'
    });
  }
});

// @route   GET /api/issues/stats/summary
// @desc    Get issue statistics summary
// @access  Private (Admin)
router.get('/stats/summary', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await Issue.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Issue.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Issue.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate resolution time for resolved issues
    const resolutionStats = await Issue.aggregate([
      { $match: { status: 'resolved', resolvedAt: { $exists: true } } },
      {
        $project: {
          resolutionTime: {
            $divide: [
              { $subtract: ['$resolvedAt', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResolutionTime: { $avg: '$resolutionTime' },
          minResolutionTime: { $min: '$resolutionTime' },
          maxResolutionTime: { $max: '$resolutionTime' }
        }
      }
    ]);

    res.json({
      status: 'success',
      data: {
        statusStats: stats,
        categoryStats,
        priorityStats,
        resolutionStats: resolutionStats[0] || {}
      }
    });

  } catch (error) {
    console.error('Get issue stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get issue statistics'
    });
  }
});

module.exports = router;
