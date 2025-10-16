import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Search, Edit, Trash2, Shield, User, Mail, Phone, Building, CheckCircle } from 'lucide-react';
import { usersAPI } from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ManageUsers = () => {
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
        alert('Failed to fetch users');
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
      alert('Failed to fetch users');
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
      alert('User created successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create user';
      alert(message);
    } finally {
      setProcessing(prev => ({ ...prev, add: false }));
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    if (processing[userId]) return;
    
    setProcessing(prev => ({ ...prev, [userId]: true }));
    
    try {
      const newStatus = currentStatus ? 'inactive' : 'active';
      await usersAPI.updateStatus(userId, newStatus);
      
      // Refresh the users list
      await refetchUsers();
      alert(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update user status';
      alert(message);
    } finally {
      setProcessing(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (processing[userId]) return;
    
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }
    
    setProcessing(prev => ({ ...prev, [userId]: true }));
    
    try {
      await usersAPI.remove(userId);
      
      // Refresh the users list
      await refetchUsers();
      alert('User deleted successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete user';
      alert(message);
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
            <h1 className="text-2xl font-bold text-dark-100">Manage Users</h1>
            <p className="text-dark-400 mt-1">Add, edit, and manage system users</p>
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
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-dark-100 mb-4">Add New User</h3>
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
        <motion.div variants={itemVariants} className="card p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or roll number..."
                  className="input pl-10"
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
            <div className="card p-8 text-center">
              <Users className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dark-300 mb-2">No users found</h3>
              <p className="text-dark-500">No users match your current filters.</p>
            </div>
          ) : (
            users.map((user) => (
              <motion.div
                key={user._id}
                variants={itemVariants}
                className="card p-6 hover:bg-dark-800/50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-dark-700">
                          {user.role === 'admin' ? (
                            <Shield className="w-5 h-5 text-purple-400" />
                          ) : (
                            <User className="w-5 h-5 text-blue-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-dark-100">{user.name}</h3>
                          <p className="text-sm text-dark-400">{user.rollNumber}</p>
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
                      className={`btn ${user.isActive ? 'btn-warning' : 'btn-success'} flex items-center justify-center text-sm`}
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
                      disabled={processing[user._id]}
                      className="btn btn-danger flex items-center justify-center text-sm"
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