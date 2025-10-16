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

const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin, user } = useAuth();

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
        <div className="flex flex-col h-full bg-dark-900 border-r border-dark-700">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-dark-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-neon rounded-lg flex items-center justify-center">
                <span className="text-dark-950 font-bold text-sm">R</span>
              </div>
              <h2 className="text-lg font-bold text-gradient">Repora</h2>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredItems.map((item) => {
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                        : 'text-dark-300 hover:bg-dark-800 hover:text-dark-100'
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
          <div className="p-4 border-t border-dark-700">
            <div className="text-xs text-dark-500 text-center">
              <p>Repora v1.0.0</p>
              <p className="mt-1">Class Representative Management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar - Animated overlay */}
      <motion.div
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-dark-900 border-r border-dark-700"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-dark-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-neon rounded-lg flex items-center justify-center">
                <span className="text-dark-950 font-bold text-sm">R</span>
              </div>
              <h2 className="text-lg font-bold text-gradient">Repora</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-dark-800 transition-colors lg:hidden"
            >
              <X className="w-5 h-5 text-dark-300" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredItems.map((item) => {
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                        : 'text-dark-300 hover:bg-dark-800 hover:text-dark-100'
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
          <div className="p-4 border-t border-dark-700">
            <div className="text-xs text-dark-500 text-center">
              <p>Repora v1.0.0</p>
              <p className="mt-1">Class Representative Management</p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;





