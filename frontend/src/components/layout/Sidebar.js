import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard,
  Calendar,
  AlertTriangle,
  Megaphone,
  User,
  X,
  CheckSquare,
  Users,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin, user } = useAuth();
  const { theme } = useTheme();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'class-representative', 'student']
    },
    {
      name: 'Bookings',
      href: '/bookings',
      icon: Calendar,
      roles: ['class-representative']
    },
    {
      name: 'Approve Bookings',
      href: '/admin/approve-bookings',
      icon: CheckSquare,
      roles: ['admin']
    },
    {
      name: 'Issues',
      href: '/issues',
      icon: AlertTriangle,
      roles: ['class-representative']
    },
    {
      name: 'Approve Issues',
      href: '/admin/approve-issues',
      icon: AlertTriangle,
      roles: ['admin']
    },
    {
      name: 'Announcements',
      href: '/announcements',
      icon: Megaphone,
      roles: ['admin', 'class-representative', 'student']
    },
    {
      name: 'Manage Users',
      href: '/admin/manage-users',
      icon: Users,
      roles: ['admin']
    },
    {
      name: 'Approve Users',
      href: '/admin/approve-users',
      icon: UserCheck,
      roles: ['admin']
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      roles: ['admin', 'class-representative', 'student']
    }
  ];

  const getUserRole = () => {
    if (isAdmin()) return 'admin';
    return user?.role || 'student';
  };

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(getUserRole())
  );

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: 'tween',
        duration: 0.3,
        ease: 'easeInOut'
      }
    },
    closed: {
      x: '-100%',
      transition: {
        type: 'tween',
        duration: 0.3,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <>
      {/* Desktop Sidebar - Always visible */}
      <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
        <div className={`flex flex-col h-full border-r transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-3">
              {/* Logo */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-orange-400 to-orange-600' 
                  : 'bg-gradient-to-br from-orange-300 to-orange-500'
              }`}>
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                </div>
              </div>
              <h2 className={`text-lg font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`} style={{ fontFamily: 'Inter, sans-serif' }}>
                Repora
              </h2>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {filteredItems.map((item) => {
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? theme === 'dark'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-orange-100 text-orange-700 border border-orange-200'
                        : theme === 'dark'
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-gray-100'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className={`p-4 border-t ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className={`text-xs text-center ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`}>
              <p>Repora v1.0.0</p>
              <p className="mt-1">Academic Resource Management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar - Animated overlay */}
      <motion.div
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 border-r transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-3">
              {/* Logo */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-orange-400 to-orange-600' 
                  : 'bg-gradient-to-br from-orange-300 to-orange-500'
              }`}>
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                </div>
              </div>
              <h2 className={`text-lg font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`} style={{ fontFamily: 'Inter, sans-serif' }}>
                Repora
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {filteredItems.map((item) => {
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? theme === 'dark'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-orange-100 text-orange-700 border border-orange-200'
                        : theme === 'dark'
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-gray-100'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className={`p-4 border-t ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className={`text-xs text-center ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`}>
              <p>Repora v1.0.0</p>
              <p className="mt-1">Academic Resource Management</p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;






