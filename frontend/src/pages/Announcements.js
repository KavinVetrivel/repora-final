import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Plus, Search, Pin, Calendar, User, Eye, Trash2 } from 'lucide-react';
import { announcementAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Announcements = () => {
  const { user } = useAuth();
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
    isPinned: false
  });

  const categoryColors = {
    general: 'bg-blue-500/20 text-blue-400',
    academic: 'bg-purple-500/20 text-purple-400',
    events: 'bg-green-500/20 text-green-400',
    exam: 'bg-orange-500/20 text-orange-400',
    holiday: 'bg-indigo-500/20 text-indigo-400',
    important: 'bg-red-500/20 text-red-400'
  };

  const priorityColors = {
    low: 'bg-blue-500/20 text-blue-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    high: 'bg-red-500/20 text-red-400'
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
    } catch (error) {
      console.error('Error fetching announcements:', error);
      alert('Failed to fetch announcements');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setProcessing(prev => ({ ...prev, create: true }));
    
    try {
      await announcementAPI.create(newAnnouncement);
      setShowCreateForm(false);
      setNewAnnouncement({
        title: '',
        content: '',
        category: 'general',
        priority: 'medium',
        isPinned: false
      });
      await fetchAnnouncements();
      alert('Announcement created successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create announcement';
      alert(message);
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
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to toggle pin status';
      alert(message);
    } finally {
      setProcessing(prev => ({ ...prev, [announcementId]: false }));
    }
  };

  const handleDeleteAnnouncement = async (announcementId, title) => {
    if (processing[announcementId]) return;
    
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }
    
    setProcessing(prev => ({ ...prev, [announcementId]: true }));
    
    try {
      await announcementAPI.delete(announcementId);
      await fetchAnnouncements();
      alert('Announcement deleted successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete announcement';
      alert(message);
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
            <h1 className="text-2xl font-bold text-dark-100">Announcements</h1>
            <p className="text-dark-400 mt-1">
              {isAdmin ? 'Create and manage announcements' : 'Stay updated with latest announcements'}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn btn-primary flex items-center"
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
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-dark-100 mb-4">Create New Announcement</h3>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  className="input"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Announcement title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Content *
                </label>
                <textarea
                  className="input resize-none"
                  rows={4}
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Announcement content"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Category
                  </label>
                  <select
                    className="input"
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
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Priority
                  </label>
                  <select
                    className="input"
                    value={newAnnouncement.priority}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Options
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded border-dark-600 bg-dark-700 text-neon-blue focus:ring-neon-blue"
                      checked={newAnnouncement.isPinned}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, isPinned: e.target.checked }))}
                    />
                    <span className="text-sm text-dark-300">Pin announcement</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={processing.create}
                  className="btn btn-primary flex items-center"
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
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div variants={itemVariants} className="card p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="text"
                  placeholder="Search announcements..."
                  className="input pl-10"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
            
            <select
              className="input w-auto"
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
              className="input w-auto"
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
            <div className="card p-8 text-center">
              <Megaphone className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dark-300 mb-2">No announcements found</h3>
              <p className="text-dark-500">
                {isAdmin ? 'Create your first announcement to get started.' : 'No announcements match your current filters.'}
              </p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <motion.div
                key={announcement._id}
                variants={itemVariants}
                className={`card p-6 hover:bg-dark-800/50 transition-colors ${
                  announcement.isPinned ? 'ring-2 ring-yellow-500/50' : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg bg-dark-700">
                          <Megaphone className="w-5 h-5 text-neon-green" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-dark-100">{announcement.title}</h3>
                            {announcement.isPinned && (
                              <Pin className="w-4 h-4 text-yellow-400" />
                            )}
                          </div>
                          <p className="text-sm text-dark-400 mt-1">
                            {getTimeAgo(announcement.publishDate || announcement.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`badge ${categoryColors[announcement.category]}`}>
                          {announcement.category}
                        </span>
                        <span className={`badge ${priorityColors[announcement.priority]}`}>
                          {announcement.priority}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="bg-dark-800 rounded-lg p-4">
                      <p className="text-dark-200 leading-relaxed">
                        {announcement.content}
                      </p>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-sm text-dark-500">
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
                        className={`btn ${announcement.isPinned ? 'btn-warning' : 'btn-secondary'} flex items-center justify-center text-sm`}
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
                        className="btn btn-danger flex items-center justify-center text-sm"
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





