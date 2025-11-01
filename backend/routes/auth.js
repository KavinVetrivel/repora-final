const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken, generateToken } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new student
// @access  Public
router.post('/register', [
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
    .custom((value) => {
      if (!value.endsWith('@psgtech.ac.in')) {
        throw new Error('Email must be from @psgtech.ac.in domain');
      }
      return true;
    })
    .withMessage('Please provide a valid @psgtech.ac.in email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('department')
    .optional()
    .isIn(['Computer Science', 'Mechanical Engineering', 'Information Technology', 'Civil Engineering', 'Administration'])
    .withMessage('Invalid department selected'),
  body('year')
    .optional()
    .isIn(['1st', '2nd', '3rd', '4th', '5th'])
    .withMessage('Year must be one of: 1st, 2nd, 3rd, 4th, 5th'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('role')
    .optional()
    .isIn(['student', 'class-representative'])
    .withMessage('Role must be either student or class-representative'),
  body('className')
    .if(body('role').not().equals('admin'))
    .notEmpty()
    .withMessage('Class name is required')
    .custom((value, { req }) => {
      const department = req.body.department;
      if (department === 'Computer Science') {
        return ['G1', 'G2', 'AIML'].includes(value);
      } else {
        return ['G1', 'G2'].includes(value);
      }
    })
    .withMessage('Invalid class name for the selected department')
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

    const { rollNumber, name, email, password, department, year, phone, role, className } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { rollNumber }]
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: existingUser.email === email 
          ? 'Email already exists' 
          : 'Roll number already exists'
      });
    }

    // Determine approval status based on role
    const userRole = role || 'student';
    const needsApproval = userRole === 'class-representative';
    
    // Create new user
    const user = new User({
      rollNumber: rollNumber.toUpperCase(),
      name,
      email,
      password,
      department,
      year: year || '1st',
      phone,
      role: userRole,
      className: userRole !== 'admin' ? className : undefined,
      isApproved: !needsApproval, // Auto-approve regular students
      isActive: true
    });

    await user.save();

    const message = needsApproval 
      ? 'Registration successful! Your account is pending admin approval. You will be able to login once approved.'
      : 'Registration successful! You can now login to your account.';

    res.status(201).json({
      status: 'success',
      message,
      data: {
        user: user.toJSON(),
        needsApproval
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user (student or admin)
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .custom((value) => {
      if (!value.endsWith('@psgtech.ac.in')) {
        throw new Error('Email must be from @psgtech.ac.in domain');
      }
      return true;
    })
    .withMessage('Please provide a valid @psgtech.ac.in email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
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

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Check if account is approved (only for class representatives)
    if (user.role === 'class-representative' && !user.isApproved) {
      return res.status(401).json({
        status: 'error',
        message: 'Your account is pending admin approval. Please wait for approval before logging in.',
        needsApproval: true
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user profile'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('department')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Department must be between 2 and 50 characters'),
  body('year')
    .optional()
    .isIn(['1st', '2nd', '3rd', '4th', '5th'])
    .withMessage('Year must be one of: 1st, 2nd, 3rd, 4th, 5th')
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

    const { name, phone, department, year } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (department) updateData.department = department;
    if (year) updateData.year = year;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile'
    });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', authenticateToken, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
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

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id);
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      status: 'success',
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to change password'
    });
  }
});

// Export both default router and a named export for tests
module.exports = router;
module.exports.authAPI = router;
