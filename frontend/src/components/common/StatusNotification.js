import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, AlertCircle, X } from 'lucide-react';

const StatusNotification = ({ notification, onClose }) => {
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
      approved: 'bg-green-500/10 border-green-500/20 text-green-400',
      rejected: 'bg-red-500/10 border-red-500/20 text-red-400',
      pending: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
      'in-progress': 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      resolved: 'bg-green-500/10 border-green-500/20 text-green-400',
      closed: 'bg-gray-500/10 border-gray-500/20 text-gray-400'
    };
    return colors[type] || 'bg-blue-500/10 border-blue-500/20 text-blue-400';
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