const express = require('express');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Issue = require('../models/Issue');
const Announcement = require('../models/Announcement');
const { authenticateToken, requireAdmin, requireStudent, requireStudentOrClassRep } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/admin
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get date range for statistics (last 30 days by default)
    const { days = 30 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(days));

    // Parallel queries for better performance
    const [
      userStats,
      bookingStats,
      issueStats,
      announcementStats,
      recentBookings,
      recentIssues,
      recentAnnouncements,
      pendingBookings,
      openIssues
    ] = await Promise.all([
      // User statistics
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]),

      // Booking statistics
      Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Issue statistics
      Issue.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Announcement statistics
      Announcement.aggregate([
        {
          $match: {
            publishDate: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        }
      ]),

      // Recent bookings
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('studentId', 'name rollNumber')
        .populate('processedBy', 'name')
        .lean(),

      // Recent issues
      Issue.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('studentId', 'name rollNumber')
        .populate('assignedTo', 'name')
        .lean(),

      // Recent announcements
      Announcement.find()
        .sort({ publishDate: -1 })
        .limit(5)
        .populate('createdBy', 'name')
        .lean(),

      // Pending bookings count
      Booking.countDocuments({ status: 'pending' }),

      // Open issues count
      Issue.countDocuments({ status: 'open' })
    ]);

    // Calculate approval rate
    const totalProcessedBookings = bookingStats.reduce((sum, stat) => {
      return stat._id === 'approved' || stat._id === 'rejected' ? sum + stat.count : sum;
    }, 0);

    const approvedBookings = bookingStats.find(stat => stat._id === 'approved')?.count || 0;
    const approvalRate = totalProcessedBookings > 0 
      ? Math.round((approvedBookings / totalProcessedBookings) * 100) 
      : 0;

    // Calculate average resolution time for issues
    const resolvedIssues = await Issue.find({
      status: 'resolved',
      resolvedAt: { $exists: true }
    }).select('createdAt resolvedAt');

    const avgResolutionTime = resolvedIssues.length > 0 
      ? Math.round(
          resolvedIssues.reduce((sum, issue) => {
            const resolutionTime = issue.resolvedAt - issue.createdAt;
            return sum + (resolutionTime / (1000 * 60 * 60 * 24)); // Convert to days
          }, 0) / resolvedIssues.length
        )
      : 0;

    // Get booking trends (last 7 days)
    const bookingTrends = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get issue trends (last 7 days)
    const issueTrends = await Issue.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      status: 'success',
      data: {
        summary: {
          totalUsers: userStats.reduce((sum, stat) => sum + stat.count, 0),
          totalStudents: userStats.find(stat => stat._id === 'student')?.count || 0,
          totalAdmins: userStats.find(stat => stat._id === 'admin')?.count || 0,
          totalBookings: bookingStats.reduce((sum, stat) => sum + stat.count, 0),
          totalIssues: issueStats.reduce((sum, stat) => sum + stat.count, 0),
          totalAnnouncements: announcementStats.reduce((sum, stat) => sum + stat.count, 0),
          pendingBookings,
          openIssues,
          approvalRate,
          avgResolutionTime
        },
        userStats,
        bookingStats,
        issueStats,
        announcementStats,
        recentActivity: {
          bookings: recentBookings,
          issues: recentIssues,
          announcements: recentAnnouncements
        },
        trends: {
          bookings: bookingTrends,
          issues: issueTrends
        }
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get admin dashboard data'
    });
  }
});

// @route   GET /api/dashboard/student/:studentId
// @desc    Get student dashboard statistics
// @access  Private (Student owner or Admin)
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check if user can access this data
    if (req.user.role !== 'admin' && req.user._id.toString() !== studentId) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied - insufficient permissions'
      });
    }

    // Get date range for statistics (last 30 days by default)
    const { days = 30 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(days));

    // Parallel queries for student data
    const [
      bookingStats,
      issueStats,
      recentBookings,
      recentIssues,
      pendingBookings,
      openIssues,
      upcomingBookings
    ] = await Promise.all([
      // Student's booking statistics
      Booking.aggregate([
        {
          $match: {
            studentId: require('mongoose').Types.ObjectId(studentId),
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Student's issue statistics
      Issue.aggregate([
        {
          $match: {
            studentId: require('mongoose').Types.ObjectId(studentId),
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Recent bookings
      Booking.find({ studentId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('processedBy', 'name')
        .lean(),

      // Recent issues
      Issue.find({ studentId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('assignedTo', 'name')
        .populate('resolvedBy', 'name')
        .lean(),

      // Pending bookings count
      Booking.countDocuments({ studentId, status: 'pending' }),

      // Open issues count
      Issue.countDocuments({ studentId, status: 'open' }),

      // Upcoming approved bookings (next 7 days)
      Booking.find({
        studentId,
        status: 'approved',
        date: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      })
        .sort({ date: 1, startTime: 1 })
        .limit(5)
        .lean()
    ]);

    // Get recent announcements relevant to student
    const student = await User.findById(studentId).select('year department');
    let announcementQuery = { isActive: true };
    
    if (student) {
      announcementQuery = {
        ...announcementQuery,
        $or: [
          { targetAudience: 'all' },
          { targetAudience: 'students' },
          { targetAudience: 'specific-year', targetYear: student.year },
          { targetAudience: 'specific-department', targetDepartment: student.department }
        ]
      };
    }

    const recentAnnouncements = await Announcement.find(announcementQuery)
      .sort({ isPinned: -1, publishDate: -1 })
      .limit(5)
      .populate('createdBy', 'name')
      .lean();

    // Calculate success rates
    const totalBookings = bookingStats.reduce((sum, stat) => sum + stat.count, 0);
    const approvedBookings = bookingStats.find(stat => stat._id === 'approved')?.count || 0;
    const bookingSuccessRate = totalBookings > 0 ? Math.round((approvedBookings / totalBookings) * 100) : 0;

    const totalIssues = issueStats.reduce((sum, stat) => sum + stat.count, 0);
    const resolvedIssues = issueStats.find(stat => stat._id === 'resolved')?.count || 0;
    const issueResolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

    // Get student's activity trends (last 7 days)
    const activityTrends = await Booking.aggregate([
      {
        $match: {
          studentId: require('mongoose').Types.ObjectId(studentId),
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          bookings: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      status: 'success',
      data: {
        summary: {
          totalBookings,
          totalIssues,
          pendingBookings,
          openIssues,
          upcomingBookings: upcomingBookings.length,
          bookingSuccessRate,
          issueResolutionRate
        },
        bookingStats,
        issueStats,
        recentActivity: {
          bookings: recentBookings,
          issues: recentIssues,
          announcements: recentAnnouncements
        },
        upcomingBookings,
        trends: {
          activity: activityTrends
        }
      }
    });

  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get student dashboard data'
    });
  }
});

// @route   GET /api/dashboard/student
// @desc    Get current student's dashboard
// @access  Private (Students)
router.get('/student', authenticateToken, requireStudentOrClassRep, async (req, res) => {
  // Redirect to the specific student dashboard
  req.params.studentId = req.user._id.toString();
  return router.handle(req, res);
});

// @route   GET /api/dashboard/analytics
// @desc    Get detailed analytics for admin
// @access  Private (Admin)
router.get('/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      groupBy = 'day' // day, week, month
    } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Determine date format based on groupBy
    let dateFormat;
    switch (groupBy) {
      case 'week':
        dateFormat = '%Y-W%U';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    // Get booking analytics
    const bookingAnalytics = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: dateFormat,
                date: '$createdAt'
              }
            },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Get issue analytics
    const issueAnalytics = await Issue.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: dateFormat,
                date: '$createdAt'
              }
            },
            category: '$category'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Get room usage analytics
    const roomAnalytics = await Booking.aggregate([
      {
        $match: {
          status: 'approved',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$room',
          count: { $sum: 1 },
          totalHours: {
            $sum: {
              $divide: [
                { $subtract: ['$endTime', '$startTime'] },
                1000 * 60 * 60
              ]
            }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      status: 'success',
      data: {
        bookingAnalytics,
        issueAnalytics,
        roomAnalytics,
        dateRange: { start, end },
        groupBy
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get analytics data'
    });
  }
});

module.exports = router;
