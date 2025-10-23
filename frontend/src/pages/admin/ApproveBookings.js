import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Clock, MapPin, FileText, Check, X, Search } from 'lucide-react';
import { bookingAPI } from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';

const ApproveBookings = () => {
  const { theme } = useTheme();
  const { success, error } = useNotification();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [filters, setFilters] = useState({
    status: 'pending',
    search: '',
    room: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  const statusColors = {
    pending: theme === 'dark' 
      ? 'bg-yellow-900/30 text-yellow-100 border-yellow-600' 
      : 'bg-yellow-50 text-yellow-800 border-yellow-300',
    approved: theme === 'dark' 
      ? 'bg-green-900/30 text-green-100 border-green-600' 
      : 'bg-green-50 text-green-800 border-green-300',
    rejected: theme === 'dark' 
      ? 'bg-red-900/30 text-red-100 border-red-600' 
      : 'bg-red-50 text-red-800 border-red-300'
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



  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const params = {
          page: pagination.current,
          limit: 10,
          ...filters
        };
        
        if (!filters.search) delete params.search;
        if (!filters.room) delete params.room;

      const response = await bookingAPI.getAll(params);
      setBookings(response.data.data.bookings || []);
      setPagination(response.data.data.pagination || { current: 1, pages: 1, total: 0 });
      } catch (error) {
        console.error('Error fetching bookings:', error);
        error('Failed to fetch bookings', { title: 'Loading Error' });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const refetchBookings = async () => {
    try {
      const params = {
        page: pagination.current,
        limit: 10,
        ...filters
      };
      
      if (!filters.search) delete params.search;
      if (!filters.room) delete params.room;

      const response = await bookingAPI.getAll(params);
      setBookings(response.data.data.bookings || []);
      setPagination(response.data.data.pagination || { current: 1, pages: 1, total: 0 });
      } catch (error) {
      console.error('Error fetching bookings:', error);
      error('Failed to fetch bookings', { title: 'Loading Error' });
    }
  };

  const handleStatusUpdate = async (bookingId, action, adminNotes = '') => {
    if (processing[bookingId]) return;
    
    setProcessing(prev => ({ ...prev, [bookingId]: true }));
    
    try {
      if (action === 'approve') {
        await bookingAPI.approve(bookingId, { adminNotes });
      } else {
        await bookingAPI.reject(bookingId, { adminNotes });
      }
      
      // Refresh the bookings list
      await refetchBookings();
      
      const actionText = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : `${action}d`;
      success(`Booking ${actionText} successfully!`, {
        title: action === 'approve' ? 'Booking Approved' : 'Booking Rejected',
        duration: 3000
      });
    } catch (error) {
      const message = error.response?.data?.message || `Failed to ${action} booking`;
      error(message, { title: 'Update Failed' });
    } finally {
      setProcessing(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleApprove = async (bookingId) => {
    // For now, use an empty string for notes - we can enhance this later with a modal
    const notes = '';
    await handleStatusUpdate(bookingId, 'approve', notes);
  };

  const handleReject = async (bookingId) => {
    // For now, use a default rejection reason - we can enhance this later with a modal  
    const notes = 'Booking rejected by admin';
    await handleStatusUpdate(bookingId, 'reject', notes);
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
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
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
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Manage Bookings</h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Review and approve classroom booking requests</p>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants} className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm p-4`}>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search by student name, roll number, or room code..."
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
            
            <select
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors w-auto ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <input
              type="text"
              placeholder="Room Code (e.g., A304)"
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors w-auto min-w-40 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
              value={filters.room}
              onChange={(e) => setFilters(prev => ({ ...prev, room: e.target.value }))}
            />
          </div>
        </motion.div>

        {/* Bookings List */}
        <motion.div variants={itemVariants} className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : !bookings || bookings.length === 0 ? (
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm p-8 text-center`}>
              <Calendar className={`w-12 h-12 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mx-auto mb-4`} />
              <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>No bookings found</h3>
              <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>No booking requests match your current filters.</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <motion.div
                key={booking._id}
                variants={itemVariants}
                className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'} border rounded-lg shadow-sm p-6 transition-colors`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-lg bg-primary-600/20">
                          <MapPin className="w-6 h-6 text-primary-400" />
                        </div>
                        <div>
                          <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-mono`}>{booking.room}</h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {parseRoomCode(booking.room)?.formatted || booking.room}
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            Requested by {booking.studentName} ({booking.studentRollNumber})
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${statusColors[booking.status]} capitalize`}>
                        {booking.status}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(booking.date)}</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <User className="w-4 h-4" />
                        <span>{booking.studentId?.email}</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <FileText className="w-4 h-4" />
                        <span className="text-xs">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Purpose */}
                    <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <strong>Purpose:</strong> {booking.purpose}
                      </p>
                    </div>

                    {/* Admin Notes */}
                    {booking.adminNotes && (
                      <div className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-200/50'} rounded-lg p-3`}>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          <strong>Admin Notes:</strong> {booking.adminNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {booking.status === 'pending' && (
                    <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:w-32">
                      <button
                        onClick={() => handleApprove(booking._id)}
                        disabled={processing[booking._id]}
                        className="btn btn-success flex items-center justify-center"
                      >
                        {processing[booking._id] ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(booking._id)}
                        disabled={processing[booking._id]}
                        className="btn btn-danger flex items-center justify-center"
                      >
                        {processing[booking._id] ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <motion.div variants={itemVariants} className="flex justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                disabled={pagination.current === 1}
                className="btn btn-secondary"
              >
                Previous
              </button>
              
              <span className="text-dark-300">
                Page {pagination.current} of {pagination.pages}
              </span>
              
              <button
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                disabled={pagination.current === pagination.pages}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ApproveBookings;