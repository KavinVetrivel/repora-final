import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, User, Clock, FileText, Check, X, Search, Eye } from 'lucide-react';
import { issueAPI } from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useTheme } from '../../contexts/ThemeContext';

const ApproveIssues = () => {
  const { theme } = useTheme();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [filters, setFilters] = useState({
    status: 'pending',
    search: '',
    category: '',
    priority: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'in-progress': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
    closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  const priorityColors = {
    low: 'bg-blue-500/20 text-blue-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    high: 'bg-orange-500/20 text-orange-400',
    urgent: 'bg-red-500/20 text-red-400'
  };

  const categoryColors = {
    academic: 'bg-purple-500/20 text-purple-400',
    infrastructure: 'bg-blue-500/20 text-blue-400',
    hostel: 'bg-green-500/20 text-green-400',
    canteen: 'bg-orange-500/20 text-orange-400',
    transport: 'bg-indigo-500/20 text-indigo-400',
    other: 'bg-gray-500/20 text-gray-400'
  };

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const params = {
          page: pagination.current,
          limit: 10,
          ...filters
        };
        
        if (!filters.search) delete params.search;
        if (!filters.category) delete params.category;
        if (!filters.priority) delete params.priority;

        const response = await issueAPI.getAll(params);
        setIssues(response.data.data.issues || []);
        setPagination(response.data.data.pagination || { current: 1, pages: 1, total: 0 });
      } catch (error) {
        console.error('Error fetching issues:', error);
        alert('Failed to fetch issues');
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const refetchIssues = async () => {
    try {
      const params = {
        page: pagination.current,
        limit: 10,
        ...filters
      };
      
      if (!filters.search) delete params.search;
      if (!filters.category) delete params.category;
      if (!filters.priority) delete params.priority;

      const response = await issueAPI.getAll(params);
      setIssues(response.data.data.issues || []);
      setPagination(response.data.data.pagination || { current: 1, pages: 1, total: 0 });
    } catch (error) {
      console.error('Error fetching issues:', error);
      alert('Failed to fetch issues');
    }
  };

  const handleStatusUpdate = async (issueId, action, adminNotes = '') => {
    if (processing[issueId]) return;
    
    setProcessing(prev => ({ ...prev, [issueId]: true }));
    
    try {
      if (action === 'resolve') {
        await issueAPI.resolve(issueId, { adminNotes });
      } else if (action === 'reject') {
        await issueAPI.reject(issueId, { adminNotes });
      } else {
        await issueAPI.updateStatus(issueId, { status: action, adminNotes });
      }
      
      // Refresh the issues list
      await refetchIssues();
      alert(`Issue ${action}d successfully`);
    } catch (error) {
      const message = error.response?.data?.message || `Failed to ${action} issue`;
      alert(message);
    } finally {
      setProcessing(prev => ({ ...prev, [issueId]: false }));
    }
  };

  const handleResolve = (issueId) => {
    const notes = prompt('Add resolution notes (optional):');
    if (notes !== null) { // User didn't cancel
      handleStatusUpdate(issueId, 'resolve', notes);
    }
  };

  const handleReject = (issueId) => {
    const notes = prompt('Add rejection reason:');
    if (notes) {
      handleStatusUpdate(issueId, 'reject', notes);
    } else if (notes !== null) {
      alert('Please provide a reason for rejection');
    }
  };

  const handleInProgress = (issueId) => {
    const notes = prompt('Add progress notes (optional):');
    if (notes !== null) { // User didn't cancel
      handleStatusUpdate(issueId, 'in-progress', notes);
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

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
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
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Manage Issues</h1>
          <p className="text-dark-400 mt-1">Review and manage student reported issues</p>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants} className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm p-4`}>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search by title, student name..."
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
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              className="input w-auto"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">All Categories</option>
              <option value="academic">Academic</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="hostel">Hostel</option>
              <option value="canteen">Canteen</option>
              <option value="transport">Transport</option>
              <option value="other">Other</option>
            </select>

            <select
              className="input w-auto"
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </motion.div>

        {/* Issues List */}
        <motion.div variants={itemVariants} className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : !issues || issues.length === 0 ? (
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm p-8 text-center`}>
              <AlertTriangle className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dark-300 mb-2">No issues found</h3>
              <p className="text-dark-500">No issues match your current filters.</p>
            </div>
          ) : (
            issues.map((issue) => (
              <motion.div
                key={issue._id}
                variants={itemVariants}
                className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'} border rounded-lg shadow-sm p-6 transition-colors`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg bg-dark-700">
                          <AlertTriangle className="w-5 h-5 text-neon-orange" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{issue.title}</h3>
                          <p className="text-sm text-dark-400">
                            Reported by {issue.studentName} ({issue.studentRollNumber})
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`badge ${statusColors[issue.status]}`}>
                          {issue.status}
                        </span>
                        <span className={`badge ${priorityColors[issue.priority]}`}>
                          {issue.priority}
                        </span>
                        <span className={`badge ${categoryColors[issue.category]}`}>
                          {issue.category}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-dark-300">
                        <Clock className="w-4 h-4" />
                        <span>{getTimeAgo(issue.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-dark-300">
                        <User className="w-4 h-4" />
                        <span>{issue.studentId?.email}</span>
                      </div>
                      {issue.resolvedAt && (
                        <div className="flex items-center space-x-2 text-dark-300">
                          <Check className="w-4 h-4" />
                          <span>Resolved {formatDate(issue.resolvedAt)}</span>
                        </div>
                      )}
                      {issue.attachments?.length > 0 && (
                        <div className="flex items-center space-x-2 text-dark-300">
                          <FileText className="w-4 h-4" />
                          <span>{issue.attachments.length} attachment{issue.attachments.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="bg-dark-800 rounded-lg p-3">
                      <p className="text-sm text-dark-300">
                        <strong>Description:</strong> {issue.description}
                      </p>
                    </div>

                    {/* Admin Notes */}
                    {issue.adminNotes && (
                      <div className="bg-dark-700/50 rounded-lg p-3">
                        <p className="text-sm text-dark-300">
                          <strong>Admin Notes:</strong> {issue.adminNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:w-40">
                    {(issue.status === 'pending' || issue.status === 'open') && (
                      <>
                        <button
                          onClick={() => handleInProgress(issue._id)}
                          disabled={processing[issue._id]}
                          className="btn btn-secondary flex items-center justify-center text-sm"
                        >
                          {processing[issue._id] ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              In Progress
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleResolve(issue._id)}
                          disabled={processing[issue._id]}
                          className="btn btn-success flex items-center justify-center text-sm"
                        >
                          {processing[issue._id] ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Resolve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(issue._id)}
                          disabled={processing[issue._id]}
                          className="btn btn-danger flex items-center justify-center text-sm"
                        >
                          {processing[issue._id] ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <>
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </>
                          )}
                        </button>
                      </>
                    )}
                    
                    {issue.status === 'in-progress' && (
                      <>
                        <button
                          onClick={() => handleResolve(issue._id)}
                          disabled={processing[issue._id]}
                          className="btn btn-success flex items-center justify-center text-sm"
                        >
                          {processing[issue._id] ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Resolve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(issue._id)}
                          disabled={processing[issue._id]}
                          className="btn btn-danger flex items-center justify-center text-sm"
                        >
                          {processing[issue._id] ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <>
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
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

export default ApproveIssues;