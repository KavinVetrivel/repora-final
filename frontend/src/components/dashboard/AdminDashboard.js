import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  AlertTriangle, 
  Megaphone,
  TrendingUp,
  Clock,
  UserCheck,
  Activity
} from 'lucide-react';
import { bookingAPI, issueAPI, announcementAPI, usersAPI } from '../../utils/api';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      pendingUsers: 0,
      approvedUsers: 0,
      totalBookings: 0,
      pendingBookings: 0,
      approvedBookings: 0,
      rejectedBookings: 0,
      totalIssues: 0,
      pendingIssues: 0,
      openIssues: 0,
      resolvedIssues: 0,
      totalAnnouncements: 0,
      pinnedAnnouncements: 0
    },
    recentBookings: [],
    recentIssues: [],
    recentAnnouncements: [],
    recentUsers: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [bookingsResponse, issuesResponse, announcementsResponse, usersResponse] = await Promise.all([
        bookingAPI.getAll({ page: 1, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' }),
        issueAPI.getAll({ page: 1, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' }),
        announcementAPI.getAllForAdmin({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
        usersAPI.list({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' })
      ]);

      const bookings = bookingsResponse.data.data.bookings || [];
      const issues = issuesResponse.data.data.issues || [];
      const announcements = announcementsResponse.data.data.announcements || [];
      const users = usersResponse.data.data.users || [];

      // Calculate comprehensive stats
      const stats = {
        totalUsers: users.length,
        pendingUsers: users.filter(u => !u.isApproved).length,
        approvedUsers: users.filter(u => u.isApproved).length,
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        approvedBookings: bookings.filter(b => b.status === 'approved').length,
        rejectedBookings: bookings.filter(b => b.status === 'rejected').length,
        totalIssues: issues.length,
        pendingIssues: issues.filter(i => i.status === 'pending').length,
        openIssues: issues.filter(i => ['open', 'in-progress'].includes(i.status)).length,
        resolvedIssues: issues.filter(i => i.status === 'resolved').length,
        totalAnnouncements: announcements.length,
        pinnedAnnouncements: announcements.filter(a => a.isPinned).length
      };

      setDashboardData({
        stats,
        recentBookings: bookings.slice(0, 5),
        recentIssues: issues.slice(0, 5),
        recentAnnouncements: announcements.slice(0, 3),
        recentUsers: users.slice(0, 5)
      });

    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  // Create stats array only when data is available
  const getStatsArray = () => {
    if (!dashboardData || loading) {
      return [
        { title: 'Total Users', value: '0', change: 'Loading...', changeType: 'neutral', icon: Users, color: 'primary', onClick: () => navigate('/admin/manage-users') },
        { title: 'Bookings', value: '0', change: 'Loading...', changeType: 'neutral', icon: Calendar, color: 'blue', onClick: () => navigate('/admin/approve-bookings') },
        { title: 'Issues', value: '0', change: 'Loading...', changeType: 'neutral', icon: AlertTriangle, color: 'orange', onClick: () => navigate('/admin/approve-issues') },
        { title: 'Announcements', value: '0', change: 'Loading...', changeType: 'neutral', icon: Megaphone, color: 'green', onClick: () => navigate('/announcements') }
      ];
    }

    return [
      {
        title: 'Total Users',
        value: dashboardData.stats.totalUsers.toString(),
        change: `${dashboardData.stats.pendingUsers} pending approval`,
        changeType: dashboardData.stats.pendingUsers > 0 ? 'attention' : 'neutral',
        icon: Users,
        color: 'primary',
        onClick: () => navigate('/admin/manage-users')
      },
      {
        title: 'Bookings',
        value: dashboardData.stats.totalBookings.toString(),
        change: `${dashboardData.stats.pendingBookings} pending`,
        changeType: dashboardData.stats.pendingBookings > 0 ? 'attention' : 'positive',
        icon: Calendar,
        color: 'blue',
        onClick: () => navigate('/admin/approve-bookings')
      },
      {
        title: 'Issues',
        value: dashboardData.stats.totalIssues.toString(),
        change: `${dashboardData.stats.pendingIssues + dashboardData.stats.openIssues} need attention`,
        changeType: (dashboardData.stats.pendingIssues + dashboardData.stats.openIssues) > 0 ? 'attention' : 'positive',
        icon: AlertTriangle,
        color: 'orange',
        onClick: () => navigate('/admin/approve-issues')
      },
      {
        title: 'Announcements',
        value: dashboardData.stats.totalAnnouncements.toString(),
        change: `${dashboardData.stats.pinnedAnnouncements} pinned`,
        changeType: 'positive',
        icon: Megaphone,
        color: 'green',
        onClick: () => navigate('/announcements')
      }
    ];
  };

  const stats = getStatsArray();

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: theme === 'dark' 
        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        : 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: theme === 'dark'
        ? 'bg-green-500/20 text-green-400 border-green-500/30'
        : 'bg-green-100 text-green-800 border-green-200',
      rejected: theme === 'dark'
        ? 'bg-red-500/20 text-red-400 border-red-500/30'
        : 'bg-red-100 text-red-800 border-red-200',
      open: theme === 'dark'
        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        : 'bg-blue-100 text-blue-800 border-blue-200',
      'in-progress': theme === 'dark'
        ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
        : 'bg-orange-100 text-orange-800 border-orange-200',
      resolved: theme === 'dark'
        ? 'bg-green-500/20 text-green-400 border-green-500/30'
        : 'bg-green-100 text-green-800 border-green-200',
      closed: theme === 'dark'
        ? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        : 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return statusConfig[status] || statusConfig.pending;
  };

  // Generate recent activities from real data
  const recentActivities = !dashboardData || loading ? [] : [
    ...(dashboardData.recentBookings || []).map(booking => ({
      id: `booking-${booking._id}`,
      type: 'booking',
      icon: Calendar,
      message: `New booking: ${booking.room || booking.roomCode} by ${booking.studentName || booking.requesterName}`,
      time: getTimeAgo(booking.createdAt),
      status: booking.status,
      details: `${booking.room || booking.roomCode} - ${formatDate(booking.date || booking.createdAt)}`,
      onClick: () => navigate('/admin/approve-bookings')
    })),
    ...(dashboardData.recentIssues || []).map(issue => ({
      id: `issue-${issue._id}`,
      type: 'issue',
      icon: AlertTriangle,
      message: `Issue: ${issue.title}`,
      time: getTimeAgo(issue.createdAt),
      status: issue.status,
      details: `Priority: ${issue.priority} - ${issue.studentName || issue.reporterName}`,
      onClick: () => navigate('/admin/approve-issues')
    })),
    ...(dashboardData.recentUsers || []).filter(user => !user.isApproved).map(user => ({
      id: `user-${user._id}`,
      type: 'user',
      icon: UserCheck,
      message: `New user registration: ${user.name}`,
      time: getTimeAgo(user.createdAt),
      status: 'pending',
      details: `${user.department} - ${user.rollNumber}`,
      onClick: () => navigate('/admin/approve-users')
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

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
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                variants={itemVariants}
                className={`p-6 rounded-xl border transition-all duration-200 cursor-pointer hover:scale-105 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                    : 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm'
                }`}
                onClick={stat.onClick}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {stat.title}
                    </p>
                    <p className={`text-2xl font-bold mt-1 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className={`text-xs font-medium ${
                        stat.changeType === 'positive' 
                          ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                          : stat.changeType === 'attention' 
                            ? theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                            : stat.changeType === 'negative' 
                              ? theme === 'dark' ? 'text-red-400' : 'text-red-600'
                              : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${
                    stat.color === 'primary' 
                      ? theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'
                      : stat.color === 'blue'
                        ? theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                        : stat.color === 'orange'
                          ? theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'
                          : theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
                  }`}>
                    <stat.icon className={`w-6 h-6 ${
                      stat.color === 'primary' 
                        ? theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                        : stat.color === 'blue'
                          ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                          : stat.color === 'orange'
                            ? theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                            : theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <motion.div variants={itemVariants} className={`p-6 rounded-xl border ${
          theme === 'dark'
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Recent Activity
            </h3>
            <Activity className={`w-5 h-5 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`} />
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentActivities.length > 0 ? recentActivities.map((activity) => (
              <div 
                key={activity.id} 
                className={`flex items-start space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}
                onClick={activity.onClick}
              >
                <div className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <activity.icon className={`w-4 h-4 ${
                    activity.type === 'booking' 
                      ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      : activity.type === 'issue' 
                        ? theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                        : activity.type === 'user' 
                          ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                          : theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {activity.message}
                  </p>
                  {activity.details && (
                    <p className={`text-xs mt-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {activity.details}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(activity.status)}`}>
                      {activity.status}
                    </span>
                    <span className={`text-xs ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {activity.time}
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <div className={`text-center py-8 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className={`p-6 rounded-xl border ${
          theme === 'dark'
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Quick Actions
            </h3>
            <Clock className={`w-5 h-5 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`} />
          </div>
          
          <div className="space-y-3">
            <button 
              className={`w-full flex items-center justify-between p-3 rounded-xl font-medium transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
              onClick={() => navigate('/admin/approve-bookings')}
            >
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Review Pending Bookings
              </div>
              {dashboardData && dashboardData.stats.pendingBookings > 0 && (
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  {dashboardData.stats.pendingBookings}
                </span>
              )}
            </button>
            <button 
              className={`w-full flex items-center justify-between p-3 rounded-xl font-medium transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              onClick={() => navigate('/admin/approve-issues')}
            >
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Manage Issues
              </div>
              {dashboardData && dashboardData.stats.pendingIssues > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {dashboardData.stats.pendingIssues}
                </span>
              )}
            </button>
            <button 
              className={`w-full flex items-center justify-between p-3 rounded-xl font-medium transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              onClick={() => navigate('/admin/approve-users')}
            >
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Approve Users
              </div>
              {dashboardData && dashboardData.stats.pendingUsers > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {dashboardData.stats.pendingUsers}
                </span>
              )}
            </button>
            <button 
              className={`w-full flex items-center justify-start p-3 rounded-xl font-medium transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              onClick={() => navigate('/announcements')}
            >
              <Megaphone className="w-4 h-4 mr-2" />
              Create Announcement
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;






