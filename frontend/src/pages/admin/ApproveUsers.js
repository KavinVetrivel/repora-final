import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Hash, 
  GraduationCap,
  Calendar,
  Phone,
  Building2
} from 'lucide-react';
import { usersAPI } from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

const ApproveUsers = () => {
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState(new Set());

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getPendingApproval({
        page: 1,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'asc' // Show oldest registrations first
      });
      setUsers(response.data.data.users || []);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      toast.error('Failed to fetch pending users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId, userName) => {
    if (processingIds.has(userId)) return;

    setProcessingIds(prev => new Set(prev).add(userId));
    try {
      await usersAPI.approve(userId);
      toast.success(`${userName} has been approved successfully!`);
      
      // Remove from list
      setUsers(prev => prev.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Failed to approve user');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleReject = async (userId, userName) => {
    if (processingIds.has(userId)) return;

    const reason = prompt(`Enter rejection reason for ${userName}:`);
    if (!reason) return;

    setProcessingIds(prev => new Set(prev).add(userId));
    try {
      await usersAPI.reject(userId, reason);
      toast.success(`${userName}'s registration has been rejected`);
      
      // Remove from list
      setUsers(prev => prev.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Failed to reject user');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`min-h-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8 text-neon-blue" />
              <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>User Approvals</h1>
            </div>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Review and approve student registration requests
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Pending Approval</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{users.length}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Processing</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{processingIds.size}</p>
                </div>
                <LoadingSpinner size="sm" />
              </div>
            </div>
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Requests</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{users.length + processingIds.size}</p>
                </div>
                <Users className="w-8 h-8 text-neon-blue" />
              </div>
            </div>
          </div>

          {/* Pending Users List */}
          {loading ? (
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm p-12 text-center`}>
              <LoadingSpinner size="lg" />
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-4`}>Loading pending user requests...</p>
            </div>
          ) : users.length === 0 ? (
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm p-12 text-center`}>
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} mb-2`}>
                All Caught Up!
              </h3>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                No pending user registrations to review at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {users.map((user) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm p-6`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-neon rounded-full flex items-center justify-center">
                          <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-bold text-lg`}>
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {user.name}
                          </h3>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending Approval
                          </span>
                        </div>
                      </div>
                      
                      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="flex items-center">
                          <Mail className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          {user.email}
                        </div>
                        <div className="flex items-center">
                          <Hash className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          {user.rollNumber}
                        </div>
                        <div className="flex items-center">
                          <Building2 className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          {user.department}
                        </div>
                        <div className="flex items-center">
                          <GraduationCap className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          {user.year} Year
                        </div>
                        {user.phone && (
                          <div className="flex items-center">
                            <Phone className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                            {user.phone}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          Registered: {formatDate(user.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6 lg:mt-0 lg:ml-6">
                      <button
                        onClick={() => handleReject(user._id, user.name)}
                        disabled={processingIds.has(user._id)}
                        className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {processingIds.has(user._id) ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleApprove(user._id, user.name)}
                        disabled={processingIds.has(user._id)}
                        className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-green-400 bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {processingIds.has(user._id) ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ApproveUsers;