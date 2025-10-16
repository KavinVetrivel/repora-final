import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Clock, MapPin, FileText, Check, X, Search } from 'lucide-react';
import { bookingAPI } from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ApproveBookings = () => {
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
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    approved: 'bg-green-500/20 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30'
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
        alert('Failed to fetch bookings');
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
      alert('Failed to fetch bookings');
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
      alert(`Booking ${action}d successfully`);
    } catch (error) {
      const message = error.response?.data?.message || `Failed to ${action} booking`;
      alert(message);
    } finally {
      setProcessing(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleApprove = (bookingId) => {
    const notes = prompt('Add approval notes (optional):');
    if (notes !== null) { // User didn't cancel
      handleStatusUpdate(bookingId, 'approve', notes);
    }
  };

  const handleReject = (bookingId) => {
    const notes = prompt('Add rejection reason:');
    if (notes) {
      handleStatusUpdate(bookingId, 'reject', notes);
    } else if (notes !== null) {
      alert('Please provide a reason for rejection');
    }
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
          <h1 className="text-2xl font-bold text-dark-100">Manage Bookings</h1>
          <p className="text-dark-400 mt-1">Review and approve classroom booking requests</p>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="card p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="text"
                  placeholder="Search by student name, roll number, or room code..."
                  className="input pl-10"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
            
            <select
              className="input w-auto"
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
              className="input w-auto min-w-40"
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
            <div className="card p-8 text-center">
              <Calendar className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dark-300 mb-2">No bookings found</h3>
              <p className="text-dark-500">No booking requests match your current filters.</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <motion.div
                key={booking._id}
                variants={itemVariants}
                className="card p-6 hover:bg-dark-800/50 transition-colors"
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
                          <h3 className="text-xl font-bold text-dark-100 font-mono">{booking.room}</h3>
                          <p className="text-sm text-dark-400">
                            {parseRoomCode(booking.room)?.formatted || booking.room}
                          </p>
                          <p className="text-sm text-dark-500">
                            Requested by {booking.studentName} ({booking.studentRollNumber})
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColors[booking.status]} capitalize`}>
                        {booking.status}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-dark-300">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(booking.date)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-dark-300">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-dark-300">
                        <User className="w-4 h-4" />
                        <span>{booking.studentId?.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-dark-300">
                        <FileText className="w-4 h-4" />
                        <span className="text-xs">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Purpose */}
                    <div className="bg-dark-800 rounded-lg p-3">
                      <p className="text-sm text-dark-300">
                        <strong>Purpose:</strong> {booking.purpose}
                      </p>
                    </div>

                    {/* Admin Notes */}
                    {booking.adminNotes && (
                      <div className="bg-dark-700/50 rounded-lg p-3">
                        <p className="text-sm text-dark-300">
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