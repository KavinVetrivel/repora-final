import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Edit, Lock, Save, X } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    year: user?.year || ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleEditProfile = () => {
    setIsEditing(true);
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
      year: user?.year || ''
    });
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const result = await updateProfile(editForm);
      
      if (result.success) {
        setMessage('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.error || 'Failed to update profile');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Failed to update profile');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setMessage('New passwords do not match');
        setTimeout(() => setMessage(''), 3000);
        setLoading(false);
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        setMessage('New password must be at least 6 characters');
        setTimeout(() => setMessage(''), 3000);
        setLoading(false);
        return;
      }

      const result = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      if (result.success) {
        setMessage('Password changed successfully!');
        setIsChangingPassword(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.error || 'Failed to change password');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Failed to change password');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-dark-950">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-dark-100">Profile</h1>
            <p className="text-dark-400 mt-2">Manage your account settings</p>
          </div>

          {/* Message Display */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 p-4 rounded-lg border ${
                message.includes('successfully') 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}
            >
              {message}
            </motion.div>
          )}

          {/* Profile Content */}
          <div className="card p-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-neon rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-dark-950 font-bold text-2xl">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-dark-100 mb-2">{user?.name}</h2>
              <p className="text-dark-400 mb-4">{user?.email}</p>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-neon-blue/20 text-neon-blue border border-neon-blue/30">
                {user?.role === 'admin' ? 'Administrator' : 'Student'}
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-dark-200 mb-4">Personal Information</h3>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-dark-400 mb-1">Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 focus:border-neon-blue focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-dark-400 mb-1">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 focus:border-neon-blue focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-dark-400 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 focus:border-neon-blue focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-dark-400 mb-1">Department</label>
                      <input
                        type="text"
                        value={editForm.department}
                        onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                        className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 focus:border-neon-blue focus:outline-none"
                      />
                    </div>
                    {user?.role !== 'admin' && (
                      <div>
                        <label className="block text-sm text-dark-400 mb-1">Year</label>
                        <input
                          type="text"
                          value={editForm.year}
                          onChange={(e) => setEditForm({...editForm, year: e.target.value})}
                          className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 focus:border-neon-blue focus:outline-none"
                        />
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-6">
                      <button 
                        onClick={handleSaveProfile} 
                        disabled={loading}
                        className="btn btn-primary flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="btn btn-secondary flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-dark-400">Roll Number</label>
                      <p className="text-dark-100 font-medium">{user?.rollNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm text-dark-400">Department</label>
                      <p className="text-dark-100 font-medium">{user?.department}</p>
                    </div>
                    {user?.role !== 'admin' && (
                      <div>
                        <label className="text-sm text-dark-400">Year</label>
                        <p className="text-dark-100 font-medium">{user?.year}</p>
                      </div>
                    )}
                    {user?.phone && (
                      <div>
                        <label className="text-sm text-dark-400">Phone</label>
                        <p className="text-dark-100 font-medium">{user?.phone}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-dark-200 mb-4">Account Settings</h3>
                
                {isChangingPassword ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-dark-400 mb-1">Current Password</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 focus:border-neon-blue focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-dark-400 mb-1">New Password</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 focus:border-neon-blue focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-dark-400 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 focus:border-neon-blue focus:outline-none"
                      />
                    </div>
                    
                    <div className="flex gap-2 mt-6">
                      <button 
                        onClick={handleChangePassword} 
                        disabled={loading}
                        className="btn btn-primary flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        {loading ? 'Changing...' : 'Change Password'}
                      </button>
                      <button 
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        }}
                        className="btn btn-secondary flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button 
                      onClick={handleEditProfile}
                      className="w-full btn btn-secondary text-left flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </button>
                    <button 
                      onClick={() => setIsChangingPassword(true)}
                      className="w-full btn btn-secondary text-left flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Change Password
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;





