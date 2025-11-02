import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Plus, 
  FileText,
  User,
  Calendar,
  Tag,
  Filter,
  Search,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { issueAPI } from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Issues = () => {
  const { isAdmin } = useAuth();
  const { theme } = useTheme();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    priority: 'all',
    search: ''
  });

  useEffect(() => {
    fetchIssues();
  }, [filters]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      if (filters.status !== 'all') {
        params.status = filters.status;
      }
      if (filters.category !== 'all') {
        params.category = filters.category;
      }
      if (filters.priority !== 'all') {
        params.priority = filters.priority;
      }
      if (filters.search) {
        params.search = filters.search;
      }

      const response = await issueAPI.getMyIssues(params);
      setIssues(response.data.data.issues || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const isDark = theme === 'dark';
    const statusConfig = {
      open: {
        color: isDark
          ? 'bg-blue-900/30 text-blue-100 border-blue-600'
          : 'bg-blue-50 text-blue-800 border-blue-300',
        icon: AlertCircle,
        text: 'Open'
      },
      'in-progress': {
        color: isDark
          ? 'bg-yellow-900/30 text-yellow-100 border-yellow-600'
          : 'bg-yellow-50 text-yellow-800 border-yellow-300',
        icon: Clock,
        text: 'In Progress'
      },
      resolved: {
        color: isDark
          ? 'bg-green-900/30 text-green-100 border-green-600'
          : 'bg-green-50 text-green-800 border-green-300',
        icon: CheckCircle,
        text: 'Resolved'
      },
      closed: {
        color: isDark
          ? 'bg-gray-700/40 text-gray-200 border-gray-600'
          : 'bg-gray-100 text-gray-700 border-gray-300',
        icon: XCircle,
        text: 'Closed'
      }
    };

    const config = statusConfig[status] || statusConfig.open;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <IconComponent className="w-4 h-4 mr-1" />
        {config.text}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const isDark = theme === 'dark';
    const priorityConfig = {
      low: {
        color: isDark ? 'bg-green-900/30 text-green-100' : 'bg-green-50 text-green-800',
        text: 'Low'
      },
      medium: {
        color: isDark ? 'bg-yellow-900/30 text-yellow-100' : 'bg-yellow-50 text-yellow-800',
        text: 'Medium'
      },
      high: {
        color: isDark ? 'bg-red-900/30 text-red-100' : 'bg-red-50 text-red-800',
        text: 'High'
      },
      critical: {
        color: isDark ? 'bg-purple-900/30 text-purple-100' : 'bg-purple-50 text-purple-800',
        text: 'Critical'
      }
    };

    const config = priorityConfig[priority] || priorityConfig.medium;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getCategoryIcon = (category) => {
    const icons = {
      technical: '💻',
      facility: '🏢',
      equipment: '🔧',
      academic: '📚',
      other: '❓'
    };
    return icons[category] || icons.other;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
              <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Issues</h1>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                Track and resolve student issues. Go to Admin Dashboard to manage issues.
              </p>
            </div>
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm p-8 text-center`}>
              <div className="text-6xl mb-4">🐛</div>
              <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
                Admin Issue Management
              </h3>
              <Link 
                to="/admin/approve-issues"
                className="btn btn-primary"
              >
                Manage Issue Reports
              </Link>
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
            }`}>My Issues</h1>
            <p className={`mt-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Track your reported issues and their resolution status
            </p>
          </div>
            <Link
              to="/raise-issue"
              className="btn btn-primary mt-4 sm:mt-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Report Issue
            </Link>
          </div>

          {/* Filters */}
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm p-6 mb-6`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} w-4 h-4`} />
                  <input
                    type="text"
                    placeholder="Search issues..."
                    className="input pl-10"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} w-4 h-4`} />
                  <select
                    className="input pl-10"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              <div>
                <select
                  className="input"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="technical">Technical</option>
                  <option value="facility">Facility</option>
                  <option value="equipment">Equipment</option>
                  <option value="academic">Academic</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <select
                  className="input"
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Issues List */}
          {loading ? (
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm p-12 text-center`}>
              <LoadingSpinner size="lg" />
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-4`}>Loading your issues...</p>
            </div>
          ) : issues.length === 0 ? (
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm p-12 text-center`}>
              <AlertTriangle className={`w-16 h-16 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} />
              <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} mb-2`}>
                No Issues Found
              </h3>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                {Object.values(filters).some(f => f !== 'all' && f !== '')
                  ? "No issues match your current filters."
                  : "You haven't reported any issues yet."
                }
              </p>
              {Object.values(filters).every(f => f === 'all' || f === '') && (
                <Link to="/raise-issue" className="btn btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Report Your First Issue
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {issues.map((issue) => (
                <motion.div
                  key={issue._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm p-6`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{getCategoryIcon(issue.category)}</span>
                        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {issue.title}
                        </h3>
                        {getStatusBadge(issue.status)}
                        {getPriorityBadge(issue.priority)}
                      </div>
                      
                      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-4 line-clamp-3`}>
                        {issue.description}
                      </p>

                      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className="flex items-center">
                          <Tag className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`} />
                          {issue.category}
                        </div>
                        <div className="flex items-center">
                          <Calendar className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`} />
                          {formatDate(issue.createdAt)}
                        </div>
                        {issue.assignedTo && (
                          <div className="flex items-center">
                            <User className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`} />
                            Assigned to {issue.assignedTo.name}
                          </div>
                        )}
                      </div>

                      {issue.status === 'resolved' && issue.resolutionNotes && (
                        <div className={`mt-4 p-3 rounded-lg border ${
                          theme === 'dark' ? 'bg-green-900/20 border-green-500/20' : 'bg-green-50 border-green-200'
                        }`}>
                          <p className={`text-sm ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
                            <strong>Resolution:</strong> {issue.resolutionNotes}
                          </p>
                          {issue.resolvedBy && (
                            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-green-400/70' : 'text-green-700/80'}`}>
                              Resolved by {issue.resolvedBy.name} on {formatDate(issue.resolvedAt)}
                            </p>
                          )}
                        </div>
                      )}

                      {issue.status === 'closed' && issue.closureReason && (
                        <div className={`mt-4 p-3 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-100 border-gray-300'
                        }`}>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            <strong>Closed:</strong> {issue.closureReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
      </motion.div>
    </div>
  );
};

export default Issues;






