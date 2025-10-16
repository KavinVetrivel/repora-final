import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  AlertTriangle, 
  Megaphone,
  CheckCircle,
  Clock,
  MapPin,
  FileText,
  Eye
} from 'lucide-react';
import { bookingAPI, issueAPI, announcementAPI } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    bookings: [],
    issues: [],
    announcements: [],
    stats: {
      totalBookings: 0,
      pendingBookings: 0,
      approvedBookings: 0,
      totalIssues: 0,
      openIssues: 0,
      resolvedIssues: 0
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch recent bookings
      const bookingsResponse = await bookingAPI.getMyBookings({ 
        page: 1, 
        limit: 5, 
        sortBy: 'createdAt', 
        sortOrder: 'desc' 
      });

      // Fetch recent issues
      const issuesResponse = await issueAPI.getMyIssues({ 
        page: 1, 
        limit: 5, 
        sortBy: 'createdAt', 
        sortOrder: 'desc' 
      });

      // Fetch recent announcements
      const announcementsResponse = await announcementAPI.getAll({ 
        page: 1, 
        limit: 5, 
        sortBy: 'createdAt', 
        sortOrder: 'desc' 
      });

      const bookings = bookingsResponse.data.data.bookings || [];
      const issues = issuesResponse.data.data.issues || [];
      const announcements = announcementsResponse.data.data.announcements || [];

      // Calculate stats
      const stats = {
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        approvedBookings: bookings.filter(b => b.status === 'approved').length,
        totalIssues: issues.length,
        openIssues: issues.filter(i => ['pending', 'open', 'in-progress'].includes(i.status)).length,
        resolvedIssues: issues.filter(i => i.status === 'resolved').length
      };

      setDashboardData({
        bookings,
        issues,
        announcements,
        stats
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
    return timeString;
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

  const stats = [
    {
      title: 'Total Bookings',
      value: dashboardData.stats.totalBookings.toString(),
      change: `${dashboardData.stats.pendingBookings} pending`,
      icon: Calendar,
      color: 'primary',
      onClick: () => navigate('/bookings')
    },
    {
      title: 'My Issues',
      value: dashboardData.stats.totalIssues.toString(),
      change: `${dashboardData.stats.openIssues} open`,
      icon: AlertTriangle,
      color: 'yellow',
      onClick: () => navigate('/issues')
    },
    {
      title: 'Approved Rate',
      value: dashboardData.stats.totalBookings > 0 
        ? `${Math.round((dashboardData.stats.approvedBookings / dashboardData.stats.totalBookings) * 100)}%`
        : '0%',
      change: `${dashboardData.stats.approvedBookings} approved`,
      icon: CheckCircle,
      color: 'green',
      onClick: () => navigate('/bookings')
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      approved: 'bg-green-500/20 text-green-400 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
      open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'in-progress': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
      closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    
    return statusConfig[status] || statusConfig.pending;
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
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <div className="flex flex-wrap gap-3">
        <button
          className="btn btn-primary flex items-center"
          onClick={() => navigate('/book-classroom')}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Book Classroom
        </button>
        <button
          className="btn btn-secondary flex items-center"
          onClick={() => navigate('/raise-issue')}
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Raise Issue
        </button>
        <button
          className="btn btn-outline flex items-center"
          onClick={() => navigate('/announcements')}
        >
          <Megaphone className="w-4 h-4 mr-2" />
          View Announcements
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                variants={itemVariants}
                className="card card-hover p-6 cursor-pointer"
                onClick={stat.onClick}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-dark-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-dark-100 mt-1">{stat.value}</p>
                    <p className="text-xs text-dark-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-${stat.color}-600/20`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <motion.div variants={itemVariants} className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-dark-100">Recent Bookings</h3>
            <Calendar className="w-5 h-5 text-dark-400" />
          </div>
          
          <div className="space-y-4">
            {dashboardData.bookings.length > 0 ? dashboardData.bookings.map((booking) => (
              <div key={booking._id} className="p-4 rounded-lg bg-dark-800 border border-dark-700 hover:bg-dark-750 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary-400" />
                    <h4 className="font-medium text-dark-100 font-mono">{booking.room}</h4>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-dark-400 mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(booking.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                  </div>
                </div>
                <p className="text-sm text-dark-300 truncate">{booking.purpose}</p>
                <p className="text-xs text-dark-500 mt-2">Created {getTimeAgo(booking.createdAt)}</p>
              </div>
            )) : (
              <div className="text-center py-8 text-dark-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No bookings yet</p>
                <button 
                  className="btn btn-sm btn-primary mt-2"
                  onClick={() => navigate('/book-classroom')}
                >
                  Book Your First Classroom
                </button>
              </div>
            )}
          </div>
          
          {dashboardData.bookings.length > 0 && (
            <div className="mt-4 text-center">
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => navigate('/bookings')}
              >
                <Eye className="w-4 h-4 mr-1" />
                View All Bookings
              </button>
            </div>
          )}
        </motion.div>

        {/* Recent Issues */}
        <motion.div variants={itemVariants} className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-dark-100">My Issues</h3>
            <AlertTriangle className="w-5 h-5 text-dark-400" />
          </div>
          
          <div className="space-y-4">
            {dashboardData.issues.length > 0 ? dashboardData.issues.map((issue) => (
              <div key={issue._id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-dark-800 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  issue.status === 'resolved' ? 'bg-green-400' : 
                  issue.status === 'pending' ? 'bg-yellow-400' :
                  issue.status === 'rejected' ? 'bg-red-400' : 'bg-blue-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-dark-200">{issue.title}</h4>
                  <p className="text-xs text-dark-400 mt-1">{issue.description}</p>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(issue.status)}`}>
                      {issue.status}
                    </span>
                    <span className="text-xs text-dark-500">{getTimeAgo(issue.createdAt)}</span>
                    {issue.priority && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        issue.priority === 'urgent' ? 'bg-red-900 text-red-300' :
                        issue.priority === 'high' ? 'bg-orange-900 text-orange-300' :
                        issue.priority === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                        'bg-gray-900 text-gray-300'
                      }`}>
                        {issue.priority}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-dark-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No issues reported</p>
                <button 
                  className="btn btn-sm btn-primary mt-2"
                  onClick={() => navigate('/raise-issue')}
                >
                  Report Your First Issue
                </button>
              </div>
            )}
          </div>
          
          {dashboardData.issues.length > 0 && (
            <div className="mt-4 text-center">
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => navigate('/issues')}
              >
                <Eye className="w-4 h-4 mr-1" />
                View All Issues
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Announcements */}
      <motion.div variants={itemVariants} className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-dark-100">Latest Announcements</h3>
          <Megaphone className="w-5 h-5 text-dark-400" />
        </div>
        
        <div className="space-y-4">
          {dashboardData.announcements.length > 0 ? dashboardData.announcements.map((announcement) => (
            <div key={announcement._id} className="p-4 rounded-lg bg-dark-800 border border-dark-700 hover:bg-dark-750 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-dark-100 flex-1">{announcement.title}</h4>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                  announcement.priority === 'high' ? 'bg-red-500/20 text-red-400' : 
                  announcement.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {announcement.priority || 'normal'}
                </span>
              </div>
              {announcement.content && (
                <p className="text-sm text-dark-300 mb-3 line-clamp-2">{announcement.content}</p>
              )}
              <div className="flex items-center justify-between text-xs text-dark-500">
                <div className="flex items-center gap-2">
                  <span className="capitalize">{announcement.category || 'general'}</span>
                  {announcement.isPinned && (
                    <span className="bg-primary-600/20 text-primary-400 px-2 py-1 rounded">Pinned</span>
                  )}
                </div>
                <span>{getTimeAgo(announcement.createdAt)}</span>
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-dark-500">
              <Megaphone className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No announcements available</p>
            </div>
          )}
        </div>
        
        {dashboardData.announcements.length > 0 && (
          <div className="mt-4 text-center">
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/announcements')}
            >
              <Eye className="w-4 h-4 mr-1" />
              View All Announcements
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default StudentDashboard;
