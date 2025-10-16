import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  Bell, 
  User, 
  LogOut, 
  ChevronDown,
  Moon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'New booking approved', time: '2 min ago', read: false },
    { id: 2, message: 'Issue status updated', time: '1 hour ago', read: true },
    { id: 3, message: 'New announcement posted', time: '3 hours ago', read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    { label: 'Profile', icon: User, onClick: () => navigate('/profile') },
    { label: 'Logout', icon: LogOut, onClick: handleLogout, danger: true }
  ];

  return (
    <nav className="bg-dark-900 border-b border-dark-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-dark-800 transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-dark-300" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-neon rounded-lg flex items-center justify-center">
              <span className="text-dark-950 font-bold text-sm">R</span>
            </div>
            <h1 className="text-xl font-bold text-gradient">Repora</h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button className="p-2 rounded-lg hover:bg-dark-800 transition-colors relative">
              <Bell className="w-5 h-5 text-dark-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-neon-blue text-dark-950 text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Theme Toggle */}
          <button className="p-2 rounded-lg hover:bg-dark-800 transition-colors">
            <Moon className="w-5 h-5 text-dark-300" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-dark-800 transition-colors"
            >
              <div className="w-8 h-8 bg-dark-700 rounded-full flex items-center justify-center">
                <span className="text-dark-300 text-sm font-medium">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-dark-100">{user?.name}</p>
                <p className="text-xs text-dark-400">{isAdmin() ? 'Admin' : 'Student'}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-dark-400" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-dark-xl z-50"
                >
                  <div className="py-1">
                    {userMenuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          item.onClick();
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                          item.danger
                            ? 'text-status-rejected hover:bg-red-900/20'
                            : 'text-dark-200 hover:bg-dark-700'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;





