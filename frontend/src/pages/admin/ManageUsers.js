import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Search, Edit, Trash2, Shield, User, Mail, Phone, Building, CheckCircle } from 'lucide-react';
import { usersAPI } from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const ManageUsers = () => {
  const { theme } = useTheme();
  const { user: currentUser } = useAuth();
  const { success, error, confirm } = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    approval: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  const [newUser, setNewUser] = useState({
    rollNumber: '',
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
    year: '1st',
    phone: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const roleColors = {
    student: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'class-representative': 'bg-green-500/20 text-green-400 border-green-500/30',
    admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  };

  const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    inactive: 'bg-red-500/20 text-red-400 border-red-500/30'
  };



  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const params = {
          page: pagination.current,
          limit: 10,
          approval: 'approved', // Only show approved users in manage users
          ...filters
        };
        
        if (!filters.search) delete params.search;
        if (!filters.role) delete params.role;
        if (!filters.status) delete params.status;
        // Override approval filter to always be 'approved' in ManageUsers
        params.approval = 'approved';

        const response = await usersAPI.list(params);
        setUsers(response.data.data.users || []);
        setPagination(response.data.data.pagination || { current: 1, pages: 1, total: 0 });
      } catch (error) {
        console.error('Error fetching users:', error);
        error('Failed to fetch users', { title: 'Loading Error' });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const refetchUsers = async () => {
    try {
      const params = {
        page: pagination.current,
        limit: 10,
        approval: 'approved', // Only show approved users in manage users
        ...filters
      };
      
      if (!filters.search) delete params.search;
      if (!filters.role) delete params.role;
      if (!filters.status) delete params.status;
      // Override approval filter to always be 'approved' in ManageUsers
      params.approval = 'approved';

      const response = await usersAPI.list(params);
      setUsers(response.data.data.users || []);
      setPagination(response.data.data.pagination || { current: 1, pages: 1, total: 0 });
    } catch (error) {
      console.error('Error fetching users:', error);
      error('Failed to fetch users', { title: 'Loading Error' });
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const errors = {};
    if (!newUser.rollNumber.trim()) errors.rollNumber = 'Roll number is required';
    if (!newUser.name.trim()) errors.name = 'Name is required';
    if (!newUser.email.trim()) errors.email = 'Email is required';
    if (!newUser.password.trim()) errors.password = 'Password is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setProcessing(prev => ({ ...prev, add: true }));
    try {
      await usersAPI.create(newUser);
      
      // Reset form and refresh list
      setNewUser({
        rollNumber: '',
        name: '',
        email: '',
        password: '',
        role: 'student',
        department: '',
        year: '1st',
        phone: ''
      });
      setFormErrors({});
      setShowAddForm(false);
      await refetchUsers();
      success('User created successfully!', { 
        title: 'User Created',
        duration: 4000 
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create user';
      error(message, { title: 'Creation Failed' });
    } finally {
      setProcessing(prev => ({ ...prev, add: false }));
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    if (processing[userId]) return;
    
    console.log('Toggle status for user:', { userId, currentStatus });
    
    setProcessing(prev => ({ ...prev, [userId]: true }));
    
    try {
      const newStatus = currentStatus ? 'inactive' : 'active';
      console.log('Sending status update:', { userId, newStatus });
      
      const response = await usersAPI.updateStatus(userId, { status: newStatus });
      console.log('Status update response:', response.data);
      
      // Refresh the users list
      await refetchUsers();
      success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`, {
        title: 'Status Updated',
        duration: 3000
      });
    } catch (error) {
      console.error('Status update error:', error);
      const message = error.response?.data?.message || 'Failed to update user status';
      error(message, { title: 'Update Failed' });
    } finally {
      setProcessing(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (processing[userId]) return;
    
    // Prevent self-deletion
    if (currentUser && currentUser._id === userId) {
      error('You cannot delete your own account', { 
        title: 'Action Not Allowed',
        duration: 4000 
      });
      return;
    }
    
    console.log('Delete user request:', { userId, userName });
    
    const confirmed = await confirm(
      `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,
      {
        title: 'Delete User',
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel'
      }
    );
    
    if (!confirmed) return;
    
    setProcessing(prev => ({ ...prev, [userId]: true }));
    
    try {
      console.log('Sending delete request for userId:', userId);
      
      const response = await usersAPI.delete(userId);
      console.log('Delete response:', response.data);
      
      // Refresh the users list
      await refetchUsers();
      success('User deleted successfully!', {
        title: 'User Deleted',
        duration: 3000
      });
    } catch (error) {
      console.error('Delete user error:', error);
      const message = error.response?.data?.message || 'Failed to delete user';
      error(message, { title: 'Deletion Failed' });
    } finally {
      setProcessing(prev => ({ ...prev, [userId]: false }));
    }
  };



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Manage Users</h1>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Add, edit, and manage system users</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary flex items-center"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </motion.div>

        {/* Add User Form */}
        {showAddForm && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm p-6`}
          >
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>Add New User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={newUser.rollNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., CS2023001"
                    className={`input ${formErrors.rollNumber ? 'border-red-500' : ''}`}
                  />
                  {formErrors.rollNumber && <p className="text-red-400 text-sm mt-1">{formErrors.rollNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    placeholder="Full name"
                    className={`input ${formErrors.name ? 'border-red-500' : ''}`}
                  />
                  {formErrors.name && <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    className={`input ${formErrors.email ? 'border-red-500' : ''}`}
                  />
                  {formErrors.email && <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    placeholder="Password (min 6 characters)"
                    className={`input ${formErrors.password ? 'border-red-500' : ''}`}
                  />
                  {formErrors.password && <p className="text-red-400 text-sm mt-1">{formErrors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="student">Student</option>
                    <option value="class-representative">Class Representative</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={newUser.department}
                    onChange={handleInputChange}
                    placeholder="e.g., Computer Science"
                    className="input"
                  />
                </div>

                {newUser.role === 'student' && (
                  <div>
                    <label className="block text-sm font-medium text-dark-200 mb-2">
                      Year
                    </label>
                    <select
                      name="year"
                      value={newUser.year}
                      onChange={handleInputChange}
                      className="input"
                    >
                      <option value="1st">1st Year</option>
                      <option value="2nd">2nd Year</option>
                      <option value="3rd">3rd Year</option>
                      <option value="4th">4th Year</option>
                      <option value="5th">5th Year</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={newUser.phone}
                    onChange={handleInputChange}
                    placeholder="Phone number"
                    className="input"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={processing.add}
                  className="btn btn-primary flex items-center"
                >
                  {processing.add ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Creating...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create User
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormErrors({});
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div variants={itemVariants} className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm p-4`}>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search by name, email, or roll number..."
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
            
            <select
              className="input w-auto"
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="class-representative">Class Representative</option>
              <option value="admin">Admin</option>
            </select>

            <select
              className="input w-auto"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </motion.div>

        {/* Users List */}
        <motion.div variants={itemVariants} className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : !users || users.length === 0 ? (
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm p-8 text-center`}>
              <Users className={`w-12 h-12 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mx-auto mb-4`} />
              <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>No users found</h3>
              <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>No users match your current filters.</p>
            </div>
          ) : (
            users.map((user) => (
              <motion.div
                key={user._id}
                variants={itemVariants}
                className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'} border rounded-lg shadow-sm p-6 transition-colors`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          {user.role === 'admin' ? (
                            <Shield className="w-5 h-5 text-purple-400" />
                          ) : (
                            <User className="w-5 h-5 text-blue-400" />
                          )}
                        </div>
                        <div>
                          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user.name}</h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{user.rollNumber}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`badge ${roleColors[user.role]}`}>
                          {user.role === 'class-representative' ? 'Class Rep' : user.role}
                        </span>
                        <span className={`badge ${statusColors[user.isActive ? 'active' : 'inactive']}`}>
                          {user.isActive ? 'active' : 'inactive'}
                        </span>
                        {user.role !== 'admin' && (
                          <span className="badge bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approved
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-dark-300">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center space-x-2 text-dark-300">
                          <Phone className="w-4 h-4" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      {user.department && (
                        <div className="flex items-center space-x-2 text-dark-300">
                          <Building className="w-4 h-4" />
                          <span>{user.department}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 text-dark-300">
                        <span className="text-xs">
                          Joined {formatDate(user.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Additional Info */}
                    {user.role === 'student' && user.year && (
                      <div className="text-sm text-dark-400">
                        Year: {user.year}
                      </div>
                    )}
                    
                    {user.lastLogin && (
                      <div className="text-sm text-dark-400">
                        Last login: {formatDate(user.lastLogin)}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:w-32">
                    {/* Actions for Approved Users Only */}
                    <button
                      onClick={() => handleToggleStatus(user._id, user.isActive)}
                      disabled={processing[user._id]}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 text-sm flex items-center justify-center ${
                        user.isActive 
                          ? `${theme === 'dark' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-white'} focus:ring-yellow-500` 
                          : `${theme === 'dark' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'} focus:ring-green-500`
                      } ${processing[user._id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {processing[user._id] ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteUser(user._id, user.name)}
                      disabled={processing[user._id] || (currentUser && currentUser._id === user._id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 text-sm flex items-center justify-center ${
                        theme === 'dark' 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      } focus:ring-red-500 ${(processing[user._id] || (currentUser && currentUser._id === user._id)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={currentUser && currentUser._id === user._id ? 'Cannot delete your own account' : 'Delete user'}
                    >
                      {processing[user._id] ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </>
                      )}
                    </button>
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

export default ManageUsers;