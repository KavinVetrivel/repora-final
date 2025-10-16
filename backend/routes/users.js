const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const buildUserQuery = (queryParams) => {
  const { role, status, approval, search } = queryParams;
  const query = {};

  if (role) {
    query.role = role;
  }

  if (status) {
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }
  }

  if (approval) {
    if (approval === 'approved') {
      query.isApproved = true;
    } else if (approval === 'pending') {
      query.isApproved = false;
    }
  }

  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { rollNumber: new RegExp(search, 'i') }
    ];
  }

  return query;
};

router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = buildUserQuery(req.query);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password')
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        users,
        pagination: {
          current: parseInt(page, 10),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get users'
    });
  }
});

router.post('/', authenticateToken, requireAdmin, [
  body('rollNumber')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Roll number must be between 3 and 20 characters'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['student', 'class-representative', 'admin'])
    .withMessage('Role must be either student, class-representative or admin'),
  body('department')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Department must be between 2 and 50 characters'),
  body('year')
    .optional()
    .isIn(['1st', '2nd', '3rd', '4th', '5th'])
    .withMessage('Year must be one of: 1st, 2nd, 3rd, 4th, 5th'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { rollNumber, name, email, password, role = 'student', department, year, phone } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { rollNumber: rollNumber.toUpperCase() }]
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: existingUser.email === email ? 'Email already registered' : 'Roll number already registered'
      });
    }

    const user = new User({
      rollNumber: rollNumber.toUpperCase(),
      name,
      email,
      password,
      role,
      department: department || 'Computer Science',
      year: year || '1st',
      phone
    });

    await user.save();

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create user'
    });
  }
});

router.patch('/:id/status', authenticateToken, requireAdmin, [
  body('status')
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    user.isActive = status === 'active';
    await user.save();

    res.json({
      status: 'success',
      message: `User ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user status'
    });
  }
});

router.patch('/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        status: 'error',
        message: 'Admin accounts cannot be approved through this endpoint'
      });
    }

    if (user.isApproved) {
      return res.status(400).json({
        status: 'error',
        message: 'User is already approved'
      });
    }

    user.isApproved = true;
    user.approvedBy = req.user._id;
    user.approvedAt = new Date();
    await user.save();

    res.json({
      status: 'success',
      message: 'User approved successfully',
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to approve user'
    });
  }
});

router.patch('/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        status: 'error',
        message: 'Admin accounts cannot be rejected through this endpoint'
      });
    }

    // For rejection, we can either delete the user or mark them as rejected
    // I'll delete the user for now, but you could add a rejection status instead
    await User.findByIdAndDelete(id);

    res.json({
      status: 'success',
      message: 'User registration rejected and account removed'
    });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reject user'
    });
  }
});

router.get('/pending-approval', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { 
      role: { $in: ['student', 'class-representative'] },
      isApproved: false,
      isActive: true
    };

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password')
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        users,
        pagination: {
          current: parseInt(page, 10),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get pending users'
    });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (req.user._id.toString() === id) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot delete your own account'
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user'
    });
  }
});

module.exports = router;
