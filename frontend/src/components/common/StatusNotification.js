import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, AlertCircle, X } from 'lucide-react';
import ThemeContext from '../../contexts/ThemeContext';

const StatusNotification = ({ notification, onClose }) => {
  const themeContext = useContext(ThemeContext);
  const theme = themeContext?.theme || 'dark';
  
  if (!notification) return null;

  const getIcon = (type) => {
    const icons = {
      approved: CheckCircle,
      rejected: XCircle,
      pending: Clock,
      'in-progress': AlertCircle,
      resolved: CheckCircle,
      closed: XCircle
    };
    return icons[type] || AlertCircle;
  };

  const getColor = (type) => {
    const colors = {
      approved: theme === 'dark' 
        ? 'bg-green-500/10 border-green-500/20 text-green-400'
        : 'bg-green-50 border-green-200 text-green-800',
      rejected: theme === 'dark'
        ? 'bg-red-500/10 border-red-500/20 text-red-400'
        : 'bg-red-50 border-red-200 text-red-800',
      pending: theme === 'dark'
        ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
        : 'bg-yellow-50 border-yellow-200 text-yellow-800',
      'in-progress': theme === 'dark'
        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
        : 'bg-blue-50 border-blue-200 text-blue-800',
      resolved: theme === 'dark'
        ? 'bg-green-500/10 border-green-500/20 text-green-400'
        : 'bg-green-50 border-green-200 text-green-800',
      closed: theme === 'dark'
        ? 'bg-gray-500/10 border-gray-500/20 text-gray-400'
        : 'bg-gray-50 border-gray-200 text-gray-800'
    };
    return colors[type] || (theme === 'dark' 
      ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
      : 'bg-blue-50 border-blue-200 text-blue-800');
  };

  const IconComponent = getIcon(notification.type);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.95 }}
        className={`fixed top-4 right-4 z-50 max-w-sm w-full p-4 rounded-lg border backdrop-blur-sm ${getColor(notification.type)}`}
      >
        <div className="flex items-start">
          <IconComponent className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold mb-1">
              {notification.title}
            </h4>
            <p className="text-sm opacity-90">
              {notification.message}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-3 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StatusNotification;