const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const { authenticateToken, requireAdmin, requireStudent, requireStudentOrClassRep, checkResourceAccess } = require('../middleware/auth');

const router = express.Router();

const getAdminBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      room,
      date,
      studentRollNumber,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (room) query.room = room.toUpperCase();
    if (date) {
      const searchDate = new Date(date);
      query.date = {
        $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
        $lte: new Date(searchDate.setHours(23, 59, 59, 999))
      };
    }
    if (studentRollNumber) {
      query.studentRollNumber = studentRollNumber.toUpperCase();
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const bookings = await Booking.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('studentId', 'name email department year')
      .populate('processedBy', 'name email')
      .lean();

    const total = await Booking.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        bookings,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get bookings'
    });
  }
};

const updateBookingStatus = async (req, res, forcedStatus = null) => {
  try {
    const { id } = req.params;
    const adminNotes = req.body?.adminNotes;
    const status = forcedStatus || req.body.status;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Status must be either approved or rejected'
      });
    }

    if (adminNotes && adminNotes.length > 200) {
      return res.status(400).json({
        status: 'error',
        message: 'Admin notes cannot exceed 200 characters'
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'Booking status has already been updated'
      });
    }

    booking.status = status;
    booking.adminNotes = adminNotes;
    booking.processedBy = req.user._id;
    booking.processedAt = new Date();

    await booking.save();

    await booking.populate('studentId', 'name email');
    await booking.populate('processedBy', 'name email');

    res.json({
      status: 'success',
      message: `Booking ${status} successfully`,
      data: {
        booking
      }
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update booking status'
    });
  }
};

// @route   GET /api/bookings/check-availability
// @desc    Check room availability for a specific time slot
// @access  Private (All authenticated users)
router.get('/check-availability', authenticateToken, async (req, res) => {
  try {
    const { room, date, startTime, endTime } = req.query;

    if (!room || !date || !startTime || !endTime) {
      return res.status(400).json({
        status: 'error',
        message: 'Room, date, start time, and end time are required'
      });
    }

    // Get existing bookings for the room and date
    const existingBookings = await Booking.find({
      room: room.toUpperCase(),
      date: {
        $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(date).setHours(23, 59, 59, 999))
      },
      status: { $in: ['pending', 'approved'] } // Only consider pending and approved bookings
    }).populate('studentId', 'name').lean();

    // Check for conflicts
    const hasConflict = existingBookings.some(booking => {
      const bookingStart = booking.startTime;
      const bookingEnd = booking.endTime;

      return (
        (startTime >= bookingStart && startTime < bookingEnd) ||
        (endTime > bookingStart && endTime <= bookingEnd) ||
        (startTime <= bookingStart && endTime >= bookingEnd)
      );
    });

    const conflictingBooking = hasConflict ? existingBookings.find(booking => {
      const bookingStart = booking.startTime;
      const bookingEnd = booking.endTime;

      return (
        (startTime >= bookingStart && startTime < bookingEnd) ||
        (endTime > bookingStart && endTime <= bookingEnd) ||
        (startTime <= bookingStart && endTime >= bookingEnd)
      );
    }) : null;

    res.json({
      status: 'success',
      data: {
        available: !hasConflict,
        existingBookings,
        conflictingBooking
      }
    });

  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check availability'
    });
  }
});

// @route   POST /api/bookings
// @desc    Create a new booking (students only)
// @access  Private (Students)
router.post('/', authenticateToken, requireStudentOrClassRep, [
  body('room')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Room name is required and must be less than 50 characters'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide start time in HH:MM format'),
  body('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide end time in HH:MM format'),
  body('purpose')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Purpose must be between 10 and 500 characters')
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

    const { room, date, startTime, endTime, purpose } = req.body;

    // Prevent past date bookings explicitly (clear message for tests/users)
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookingDate < today) {
      return res.status(400).json({
        status: 'error',
        message: 'Booking date cannot be in the past'
      });
    }

    // Check if end time is after start time
    if (endTime <= startTime) {
      return res.status(400).json({
        status: 'error',
        message: 'End time must be after start time'
      });
    }

    // Check for overlapping bookings
    const overlappingBooking = await Booking.checkOverlap(
      room.toUpperCase(),
      date,
      startTime,
      endTime
    );

    if (overlappingBooking) {
      return res.status(400).json({
        status: 'error',
        message: 'This room is already booked for the selected time slot',
        conflictingBooking: {
          id: overlappingBooking._id,
          startTime: overlappingBooking.startTime,
          endTime: overlappingBooking.endTime,
          student: overlappingBooking.studentName
        }
      });
    }

    // Create new booking
    const booking = new Booking({
      studentId: req.user._id,
      studentRollNumber: req.user.rollNumber,
      studentName: req.user.name,
      room: room.toUpperCase(),
      date: new Date(date),
      startTime,
      endTime,
      purpose
    });

    await booking.save();

    res.status(201).json({
      status: 'success',
      message: 'Booking created successfully',
      data: {
        booking
      }
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/bookings/student/:studentId
// @desc    Get bookings for a specific student
// @access  Private (Student owner or Admin)
router.get('/student/:studentId', authenticateToken, checkResourceAccess('studentId'), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const query = { studentId };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .sort({ date: -1, startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('processedBy', 'name email')
      .lean();

    const total = await Booking.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        bookings,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get student bookings error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get bookings'
    });
  }
});

// @route   GET /api/bookings/my-bookings
// @desc    Get current user's bookings
// @access  Private (Students)
router.get('/my-bookings', authenticateToken, requireStudentOrClassRep, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { studentId: req.user._id };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .sort({ date: -1, startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('processedBy', 'name email')
      .lean();

    const total = await Booking.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        bookings,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get bookings'
    });
  }
});

// @route   GET /api/bookings/all
// @desc    Get all bookings (admin only)
// @access  Private (Admin)
router.get('/', authenticateToken, requireAdmin, getAdminBookings);

router.get('/all', authenticateToken, requireAdmin, getAdminBookings);

// @route   PATCH /api/bookings/:id/status
// @desc    Update booking status (admin only)
// @access  Private (Admin)
router.patch('/:id/status', authenticateToken, requireAdmin, [
  body('status')
    .isIn(['approved', 'rejected'])
    .withMessage('Status must be either approved or rejected'),
  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Admin notes cannot exceed 200 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  return updateBookingStatus(req, res);
});

router.patch('/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  return updateBookingStatus(req, res, 'approved');
});

router.patch('/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  return updateBookingStatus(req, res, 'rejected');
});

// @route   DELETE /api/bookings/:id
// @desc    Delete a booking
// @access  Private (Student owner or Admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if user can delete this booking
    const canDelete = req.user.role === 'admin' || 
                     booking.studentId.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied - insufficient permissions'
      });
    }

    // Students can only delete pending bookings
    if (req.user.role === 'student' && booking.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete approved or rejected bookings'
      });
    }

    await Booking.findByIdAndDelete(id);

    res.json({
      status: 'success',
      message: 'Booking deleted successfully'
    });

  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete booking'
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get a specific booking
// @access  Private (Student owner or Admin)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('studentId', 'name email department year')
      .populate('processedBy', 'name email');

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if user can view this booking
    const canView = req.user.role === 'admin' || 
                   booking.studentId._id.toString() === req.user._id.toString();

    if (!canView) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied - insufficient permissions'
      });
    }

    res.json({
      status: 'success',
      data: {
        booking
      }
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get booking'
    });
  }
});

// Export both default router and a named export for tests
module.exports = router;
module.exports.bookingAPI = router;
