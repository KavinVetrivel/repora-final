import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Plus, Search, Pin, Calendar, User, Eye, Trash2 } from 'lucide-react';
import { announcementAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Announcements = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { success, error, confirm } = useNotification();
  const isAdmin = user?.role === 'admin';
  
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [processing, setProcessing] = useState({});
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    search: ''
  });
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'medium',
    targetAudience: 'all',
    targetClasses: [],
    isPinned: false
  });

  const departments = [
    'Computer Science',
    'Mechanical Engineering', 
    'Information Technology',
    'Civil Engineering'
  ];

  const getClassesForDepartment = (department) => {
    if (department === 'Computer Science') {
      return ['G1', 'G2', 'AIML'];
    }
    return ['G1', 'G2'];
  };

  const categoryColors = {
    general: theme === 'dark' 
      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
      : 'bg-blue-50 text-blue-700 border-blue-200',
    academic: theme === 'dark'
      ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      : 'bg-purple-50 text-purple-700 border-purple-200',
    events: theme === 'dark'
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : 'bg-green-50 text-green-700 border-green-200',
    exam: theme === 'dark'
      ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      : 'bg-orange-50 text-orange-700 border-orange-200',
    holiday: theme === 'dark'
      ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
      : 'bg-indigo-50 text-indigo-700 border-indigo-200',
    important: theme === 'dark'
      ? 'bg-red-500/20 text-red-400 border-red-500/30'
      : 'bg-red-50 text-red-700 border-red-200'
  };

  const priorityColors = {
    low: theme === 'dark'
      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      : 'bg-blue-50 text-blue-700 border-blue-200',
    medium: theme === 'dark'
      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      : 'bg-yellow-50 text-yellow-700 border-yellow-200',
    high: theme === 'dark'
      ? 'bg-red-500/20 text-red-400 border-red-500/30'
      : 'bg-red-50 text-red-700 border-red-200'
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      
      if (!filters.search) delete params.search;
      if (!filters.category) delete params.category;
      if (!filters.priority) delete params.priority;

      const response = isAdmin 
        ? await announcementAPI.getAllForAdmin(params)
        : await announcementAPI.getAll(params);
        
      setAnnouncements(response.data.data.announcements || []);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      error('Failed to fetch announcements', { title: 'Loading Error' });
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      error('Please fill in all required fields', { title: 'Validation Error' });
      return;
    }

    if (newAnnouncement.targetAudience === 'specific-classes' && newAnnouncement.targetClasses.length === 0) {
      error('Please select at least one class when targeting specific classes', { title: 'Validation Error' });
      return;
    }

    setProcessing(prev => ({ ...prev, create: true }));
    
    try {
      console.log('📝 Sending announcement data:', JSON.stringify(newAnnouncement, null, 2));
      await announcementAPI.create(newAnnouncement);
      setShowCreateForm(false);
      setNewAnnouncement({
        title: '',
        content: '',
        category: 'general',
        priority: 'medium',
        targetAudience: 'all',
        targetClasses: [],
        isPinned: false
      });
      await fetchAnnouncements();
      success('Announcement created successfully!', { 
        title: 'Success', 
        duration: 4000 
      });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create announcement';
      error(message, { title: 'Creation Failed' });
    } finally {
      setProcessing(prev => ({ ...prev, create: false }));
    }
  };

  const handleTogglePin = async (announcementId, currentPinned) => {
    if (processing[announcementId]) return;
    
    setProcessing(prev => ({ ...prev, [announcementId]: true }));
    
    try {
      await announcementAPI.togglePin(announcementId);
      await fetchAnnouncements();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to toggle pin status';
      error(message, { title: 'Update Failed' });
    } finally {
      setProcessing(prev => ({ ...prev, [announcementId]: false }));
    }
  };

  const handleDeleteAnnouncement = async (announcementId, title) => {
    if (processing[announcementId]) return;
    
    const confirmed = await confirm(
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      { 
        title: 'Delete Announcement',
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel'
      }
    );
    
    if (!confirmed) return;
    
    setProcessing(prev => ({ ...prev, [announcementId]: true }));
    
    try {
      await announcementAPI.delete(announcementId);
      await fetchAnnouncements();
      success('Announcement deleted successfully!', { 
        title: 'Deleted',
        duration: 3000 
      });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete announcement';
      error(message, { title: 'Deletion Failed' });
    } finally {
      setProcessing(prev => ({ ...prev, [announcementId]: false }));
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

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

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
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Announcements</h1>
            <p className={`mt-1 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {isAdmin ? 'Create and manage announcements' : 'Stay updated with latest announcements'}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Announcement
            </button>
          )}
        </motion.div>

        {/* Create Announcement Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg border p-6 ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Create New Announcement</h3>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Title *
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500/20'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-orange-500/20'
                  } focus:ring-2 focus:outline-none`}
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Announcement title"
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Content *
                </label>
                <textarea
                  className={`w-full px-4 py-2 rounded-lg border transition-colors resize-none ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500/20'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-orange-500/20'
                  } focus:ring-2 focus:outline-none`}
                  rows={4}
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Announcement content"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Category
                  </label>
                  <select
                    className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-orange-500'
                    } focus:ring-2 focus:ring-orange-500/20 focus:outline-none`}
                    value={newAnnouncement.category}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="general">General</option>
                    <option value="academic">Academic</option>
                    <option value="events">Events</option>
                    <option value="exam">Exam</option>
                    <option value="holiday">Holiday</option>
                    <option value="important">Important</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Priority
                  </label>
                  <select
                    className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-orange-500'
                    } focus:ring-2 focus:ring-orange-500/20 focus:outline-none`}
                    value={newAnnouncement.priority}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Target Audience
                  </label>
                  <select
                    className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-orange-500'
                    } focus:ring-2 focus:ring-orange-500/20 focus:outline-none`}
                    value={newAnnouncement.targetAudience}
                    onChange={(e) => setNewAnnouncement(prev => ({ 
                      ...prev, 
                      targetAudience: e.target.value,
                      targetClasses: e.target.value === 'specific-classes' ? prev.targetClasses : []
                    }))}
                  >
                    <option value="all">All Students</option>
                    <option value="students">General Students</option>
                    <option value="specific-classes">Specific Classes</option>
                  </select>
                </div>
              </div>

              {/* Class Selection for Specific Classes */}
              {newAnnouncement.targetAudience === 'specific-classes' && (
                <div>
                  <label className={`block text-sm font-medium mb-3 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Select Target Classes *
                  </label>
                  <div className="space-y-4">
                    {['1st', '2nd', '3rd', '4th', '5th'].map(year => (
                      <div key={year}>
                        <h4 className={`font-semibold mb-3 text-lg ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>{year} Year</h4>
                        <div className="space-y-3">
                          {departments.map(department => (
                            <div key={`${year}-${department}`} className={`p-4 rounded-lg border ${
                              theme === 'dark'
                                ? 'border-gray-600 bg-gray-700/50'
                                : 'border-gray-200 bg-gray-50'
                            }`}>
                              <h5 className={`font-medium mb-2 ${
                                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                              }`}>{department}</h5>
                              <div className="grid grid-cols-3 gap-3">
                                {getClassesForDepartment(department).map(className => {
                                  const classKey = `${year}-${department}-${className}`;
                                  const isSelected = newAnnouncement.targetClasses.some(
                                    tc => tc.year === year && tc.department === department && tc.className === className
                                  );
                                  return (
                                    <label key={classKey} className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        className={`rounded border-2 ${
                                          theme === 'dark'
                                            ? 'border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500/20'
                                            : 'border-gray-300 bg-white text-orange-500 focus:ring-orange-500/20'
                                        } focus:ring-2`}
                                        checked={isSelected}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setNewAnnouncement(prev => ({
                                              ...prev,
                                              targetClasses: [...prev.targetClasses, { year, department, className }]
                                            }));
                                          } else {
                                            setNewAnnouncement(prev => ({
                                              ...prev,
                                              targetClasses: prev.targetClasses.filter(
                                                tc => !(tc.year === year && tc.department === department && tc.className === className)
                                              )
                                            }));
                                          }
                                        }}
                                      />
                                      <span className={`text-sm font-medium ${
                                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                      }`}>{className}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Options
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className={`rounded border-2 ${
                      theme === 'dark'
                        ? 'border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500/20'
                        : 'border-gray-300 bg-white text-orange-500 focus:ring-orange-500/20'
                    } focus:ring-2`}
                    checked={newAnnouncement.isPinned}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, isPinned: e.target.checked }))}
                  />
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>Pin announcement</span>
                </label>
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={processing.create}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  {processing.create ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Creating...</span>
                    </>
                  ) : (
                    'Create Announcement'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div variants={itemVariants} className={`rounded-lg border p-4 ${
          theme === 'dark'
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search announcements..."
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-500'
                  } focus:ring-2 focus:ring-orange-500/20 focus:outline-none`}
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
            
            <select
              className={`px-4 py-2 rounded-lg border transition-colors w-auto ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-orange-500'
              } focus:ring-2 focus:ring-orange-500/20 focus:outline-none`}
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">All Categories</option>
              <option value="general">General</option>
              <option value="academic">Academic</option>
              <option value="events">Events</option>
              <option value="exam">Exam</option>
              <option value="holiday">Holiday</option>
              <option value="important">Important</option>
            </select>

            <select
              className={`px-4 py-2 rounded-lg border transition-colors w-auto ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-orange-500'
              } focus:ring-2 focus:ring-orange-500/20 focus:outline-none`}
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </motion.div>

        {/* Announcements List */}
        <motion.div variants={itemVariants} className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : !announcements || announcements.length === 0 ? (
            <div className={`rounded-lg border p-8 text-center ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <Megaphone className={`w-12 h-12 mx-auto mb-4 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <h3 className={`text-lg font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>No announcements found</h3>
              <p className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
                {isAdmin ? 'Create your first announcement to get started.' : 'No announcements match your current filters.'}
              </p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <motion.div
                key={announcement._id}
                variants={itemVariants}
                className={`rounded-lg border p-6 transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                } ${
                  announcement.isPinned ? 'ring-2 ring-yellow-500/50' : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-orange-50'
                        }`}>
                          <Megaphone className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className={`text-lg font-semibold ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>{announcement.title}</h3>
                            {announcement.isPinned && (
                              <Pin className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {getTimeAgo(announcement.publishDate || announcement.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${categoryColors[announcement.category]}`}>
                          {announcement.category}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${priorityColors[announcement.priority]}`}>
                          {announcement.priority}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`rounded-lg p-4 ${
                      theme === 'dark'
                        ? 'bg-gray-700/50'
                        : 'bg-gray-50'
                    }`}>
                      <p className={`leading-relaxed ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        {announcement.content}
                      </p>
                    </div>

                    {/* Metadata */}
                    <div className={`flex items-center justify-between text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>By Admin</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(announcement.publishDate || announcement.createdAt)}</span>
                        </div>
                        {announcement.views && (
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{announcement.views} views</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Admin Actions */}
                  {isAdmin && (
                    <div className="flex flex-col gap-2 lg:w-32">
                      <button
                        onClick={() => handleTogglePin(announcement._id, announcement.isPinned)}
                        disabled={processing[announcement._id]}
                        className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center ${
                          announcement.isPinned 
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            : theme === 'dark'
                              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        {processing[announcement._id] ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <Pin className="w-4 h-4 mr-2" />
                            {announcement.isPinned ? 'Unpin' : 'Pin'}
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement._id, announcement.title)}
                        disabled={processing[announcement._id]}
                        className="bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center"
                      >
                        {processing[announcement._id] ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
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
      </motion.div>
    </div>
  );
};

export default Announcements;






