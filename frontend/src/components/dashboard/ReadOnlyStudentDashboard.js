import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar,
  Clock,
  MapPin,
  Megaphone,
  BookOpen,
  Users,
  AlertCircle,
  Eye
} from 'lucide-react';
import { announcementAPI, bookingAPI } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';

const ReadOnlyStudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    announcements: [],
    todayBookings: [],
    upcomingBookings: [],
    stats: {
      totalAnnouncements: 0,
      todayClasses: 0,
      upcomingClasses: 0
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get current date for filtering
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Fetch announcements and bookings
      const [announcementsResponse, bookingsResponse] = await Promise.all([
        announcementAPI.getAll({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
        bookingAPI.getAll({ page: 1, limit: 50, sortBy: 'date', sortOrder: 'asc' })
      ]);

      const announcements = announcementsResponse.data.data.announcements || [];
      const allBookings = bookingsResponse.data.data.bookings || [];
      
      // Filter bookings for today and upcoming
      const todayBookings = allBookings.filter(booking => {
        const bookingDate = new Date(booking.date).toISOString().split('T')[0];
        return bookingDate === todayStr && booking.status === 'approved';
      });
      
      const upcomingBookings = allBookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate > today && booking.status === 'approved';
      }).slice(0, 5);

      setDashboardData({
        announcements,
        todayBookings,
        upcomingBookings,
        stats: {
          totalAnnouncements: announcements.length,
          todayClasses: todayBookings.length,
          upcomingClasses: upcomingBookings.length
        }
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-dark-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-dark-950">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-8 h-8 text-neon-blue" />
              <h1 className="text-3xl font-bold text-dark-100">Student Portal</h1>
            </div>
            <p className="text-dark-400">View announcements and classroom schedules</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div variants={itemVariants} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Total Announcements</p>
                  <p className="text-2xl font-bold text-dark-100 mt-1">
                    {dashboardData.stats.totalAnnouncements}
                  </p>
                  <p className="text-xs text-dark-500 mt-2">Latest updates</p>
                </div>
                <div className="p-3 bg-neon-blue/20 rounded-xl">
                  <Megaphone className="w-6 h-6 text-neon-blue" />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Today's Classes</p>
                  <p className="text-2xl font-bold text-dark-100 mt-1">
                    {dashboardData.stats.todayClasses}
                  </p>
                  <p className="text-xs text-dark-500 mt-2">Scheduled for today</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Calendar className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Upcoming Classes</p>
                  <p className="text-2xl font-bold text-dark-100 mt-1">
                    {dashboardData.stats.upcomingClasses}
                  </p>
                  <p className="text-xs text-dark-500 mt-2">Next few days</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Announcements */}
            <motion.div variants={itemVariants} className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-dark-100">Recent Announcements</h3>
                <Megaphone className="w-5 h-5 text-dark-400" />
              </div>
              
              <div className="space-y-4">
                {dashboardData.announcements.length > 0 ? dashboardData.announcements.map((announcement) => (
                  <div key={announcement._id} className="p-4 bg-dark-800 rounded-lg border border-dark-600">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-dark-100 line-clamp-1">{announcement.title}</h4>
                      {announcement.isPinned && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neon-blue/20 text-neon-blue border border-neon-blue/30 ml-2">
                          Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-dark-300 line-clamp-2 mb-3">{announcement.content}</p>
                    <div className="flex items-center justify-between text-xs text-dark-500">
                      <span>By {announcement.authorName}</span>
                      <span>{getTimeAgo(announcement.createdAt)}</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-dark-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No announcements available</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Today's Schedule */}
            <motion.div variants={itemVariants} className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-dark-100">Today's Schedule</h3>
                <Calendar className="w-5 h-5 text-dark-400" />
              </div>
              
              <div className="space-y-3">
                {dashboardData.todayBookings.length > 0 ? dashboardData.todayBookings.map((booking) => (
                  <div key={booking._id} className="flex items-center space-x-4 p-3 bg-dark-800 rounded-lg border border-dark-600">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <MapPin className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark-100">{booking.roomCode || booking.room}</p>
                      <p className="text-xs text-dark-400">{booking.purpose || 'Class'}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-xs text-dark-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </div>
                      <p className="text-xs text-dark-500 mt-1">
                        {booking.requesterName || booking.studentName}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-dark-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No classes scheduled for today</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Upcoming Classes */}
          {dashboardData.upcomingBookings.length > 0 && (
            <motion.div variants={itemVariants} className="mt-8 card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-dark-100">Upcoming Classes</h3>
                <BookOpen className="w-5 h-5 text-dark-400" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.upcomingBookings.map((booking) => (
                  <div key={booking._id} className="p-4 bg-dark-800 rounded-lg border border-dark-600">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-dark-100">{booking.roomCode || booking.room}</h4>
                      <span className="text-xs text-neon-blue font-medium">
                        {formatDate(booking.date)}
                      </span>
                    </div>
                    <p className="text-sm text-dark-300 mb-2">{booking.purpose || 'Class'}</p>
                    <div className="flex items-center justify-between text-xs text-dark-500">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {booking.requesterName || booking.studentName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ReadOnlyStudentDashboard;