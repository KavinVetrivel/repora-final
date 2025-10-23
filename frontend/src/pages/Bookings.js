import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock3, 
  FileText,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { bookingAPI } from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Bookings = () => {
  const { isAdmin } = useAuth();
  const { theme } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: 50,
        sortBy: 'date',
        sortOrder: 'desc'
      };

      if (filters.status !== 'all') {
        params.status = filters.status;
      }
      if (filters.search) {
        params.search = filters.search;
      }

      const response = await bookingAPI.getMyBookings(params);
      setBookings(response.data.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: theme === 'dark' 
          ? 'bg-yellow-900/30 text-yellow-100 border-yellow-600' 
          : 'bg-yellow-50 text-yellow-800 border-yellow-300',
        icon: Clock3,
        text: 'Pending Approval',
        bgColor: 'bg-yellow-900/20'
      },
      approved: {
        color: theme === 'dark' 
          ? 'bg-green-900/30 text-green-100 border-green-600' 
          : 'bg-green-50 text-green-800 border-green-300',
        icon: CheckCircle,
        text: 'Approved',
        bgColor: 'bg-green-900/20'
      },
      rejected: {
        color: theme === 'dark' 
          ? 'bg-red-900/30 text-red-100 border-red-600' 
          : 'bg-red-50 text-red-800 border-red-300',
        icon: XCircle,
        text: 'Rejected',
        bgColor: 'bg-red-900/20'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${config.color}`}>
        <IconComponent className="w-4 h-4 mr-1" />
        {config.text}
      </span>
    );
  };

  const parseRoomCode = (roomCode) => {
    if (!roomCode) return null;
    
    // Parse room codes like A304, B215, etc.
    const match = roomCode.match(/^([A-Z])(\d)(\d{2})$/);
    if (match) {
      return {
        block: match[1],
        floor: match[2],
        room: match[3],
        formatted: `${match[1]} Block, Floor ${match[2]}, Room ${match[3]}`
      };
    }
    
    // Fallback for older room formats
    return {
      block: null,
      floor: null,
      room: null,
      formatted: roomCode
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (isAdmin()) {
    return (
      <div className={`min-h-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            <div className="mb-8">
              <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Bookings</h1>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                Manage all room bookings. Go to Admin Dashboard to approve/reject bookings.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-8 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
                  Approve Bookings
                </h3>
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                  Review and approve pending classroom booking requests
                </p>
                <Link 
                  to="/admin/approve-bookings"
                  className="btn btn-primary"
                >
                  Manage Booking Requests
                </Link>
              </div>
              
              <div className="card p-8 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
                  All Bookings
                </h3>
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                  View all bookings across the college with filtering options
                </p>
                <Link 
                  to="/dashboard"
                  className="btn btn-outline"
                >
                  View All Bookings
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>My Bookings</h1>
            <p className={`mt-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Track your classroom booking requests and their approval status
            </p>
          </div>
          <Link
            to="/book-classroom"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center mt-4 sm:mt-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Link>
          </div>

          {/* Quick Stats */}
          {!loading && bookings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm p-4 text-center`}>
                <div className="text-2xl font-bold text-yellow-400">
                  {bookings.filter(b => b.status === 'pending').length}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Pending Approval</div>
              </div>
              <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm p-4 text-center`}>
                <div className="text-2xl font-bold text-green-400">
                  {bookings.filter(b => b.status === 'approved').length}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Approved</div>
              </div>
              <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm p-4 text-center`}>
                <div className="text-2xl font-bold text-red-400">
                  {bookings.filter(b => b.status === 'rejected').length}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Rejected</div>
              </div>
            </div>
          )}

        {/* Filters */}
        <div className={`rounded-lg border p-6 ${
          theme === 'dark'
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search by room (e.g., A304, B block), purpose, or student name..."
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-500'
                  } focus:ring-2 focus:ring-orange-500/20 focus:outline-none`}
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
            <div className="sm:w-48">
              <div className="relative">
                <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <select
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-orange-500'
                  } focus:ring-2 focus:ring-orange-500/20 focus:outline-none`}
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="card p-12 text-center">
              <LoadingSpinner size="lg" />
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-4`}>Loading your bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="card p-12 text-center">
              <Calendar className={`w-16 h-16 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} />
              <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} mb-2`}>
                No Bookings Found
              </h3>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                {filters.status !== 'all' || filters.search
                  ? "No bookings match your current filters."
                  : "You haven't made any booking requests yet."
                }
              </p>
              {(!filters.status || filters.status === 'all') && !filters.search && (
                <Link to="/book-classroom" className="btn btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Book Your First Classroom
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm p-6 hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}
                >
                  <div className="flex flex-col space-y-4">
                    {/* Header with Room and Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-600/20 p-2 rounded-lg">
                          <MapPin className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                          <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-mono`}>
                            {booking.room}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {parseRoomCode(booking.room)?.formatted || booking.room}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    
                    {/* Booking Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className={`flex items-center gap-3 p-3 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'} rounded-lg`}>
                        <Calendar className="w-5 h-5 text-blue-400 flex-shrink-0" />
                        <div>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wide`}>Date</p>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                            {formatDate(booking.date)}
                          </p>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-3 p-3 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'} rounded-lg`}>
                        <Clock className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <div>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wide`}>Time</p>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                          </p>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-3 p-3 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'} rounded-lg sm:col-span-2 lg:col-span-1`}>
                        <FileText className="w-5 h-5 text-purple-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wide`}>Purpose</p>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'} truncate`} title={booking.purpose}>
                            {booking.purpose}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Student Information */}
                    <div className="flex items-center gap-3 p-3 bg-dark-800/30 rounded-lg border border-dark-700">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {booking.studentName?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{booking.studentName}</p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Roll No: {booking.studentRollNumber}</p>
                      </div>
                    </div>

                    {/* Status-specific Information */}
                    {booking.status === 'rejected' && booking.adminNotes && (
                      <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 border-red-500/20' : 'bg-red-50 border-red-200'} border rounded-lg`}>
                        <div className="flex items-start gap-2">
                          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-600'} mb-1`}>Rejection Reason</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>{booking.adminNotes}</p>
                            {booking.processedBy && (
                              <p className="text-xs text-red-400/70 mt-2">
                                Rejected by {booking.processedBy.name} on {formatDate(booking.processedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {booking.status === 'approved' && (
                      <div className="p-4 bg-green-900/20 border border-green-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-green-400 mb-1">Booking Approved</p>
                            {booking.adminNotes && (
                              <p className="text-sm text-green-300 mb-2">{booking.adminNotes}</p>
                            )}
                            {booking.processedBy && (
                              <p className="text-xs text-green-400/70">
                                Approved by {booking.processedBy.name} on {formatDate(booking.processedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {booking.status === 'pending' && (
                      <div className="p-4 bg-yellow-900/20 border border-yellow-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Clock3 className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-yellow-400 mb-1">Awaiting Approval</p>
                            <p className="text-sm text-yellow-300">
                              Your booking request has been submitted and is waiting for admin approval.
                            </p>
                            <p className="text-xs text-yellow-400/70 mt-2">
                              Submitted on {formatDate(booking.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
      </motion.div>
    </div>
  );
};

export default Bookings;

