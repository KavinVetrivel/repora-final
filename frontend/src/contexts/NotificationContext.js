import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useTheme } from './ThemeContext';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const NotificationItem = ({ notification, onClose }) => {
  const { theme } = useTheme();
  
  const getIcon = (type) => {
    const icons = {
      success: CheckCircle,
      error: XCircle,
      warning: AlertTriangle,
      info: Info,
    };
    return icons[type] || Info;
  };

  const getColors = (type) => {
    const colors = {
      success: {
        bg: theme === 'dark' ? 'bg-green-900/50' : 'bg-green-50',
        border: theme === 'dark' ? 'border-green-500/30' : 'border-green-200',
        text: theme === 'dark' ? 'text-green-400' : 'text-green-800',
        icon: 'text-green-500'
      },
      error: {
        bg: theme === 'dark' ? 'bg-red-900/50' : 'bg-red-50',
        border: theme === 'dark' ? 'border-red-500/30' : 'border-red-200',
        text: theme === 'dark' ? 'text-red-400' : 'text-red-800',
        icon: 'text-red-500'
      },
      warning: {
        bg: theme === 'dark' ? 'bg-yellow-900/50' : 'bg-yellow-50',
        border: theme === 'dark' ? 'border-yellow-500/30' : 'border-yellow-200',
        text: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-800',
        icon: 'text-yellow-500'
      },
      info: {
        bg: theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-50',
        border: theme === 'dark' ? 'border-blue-500/30' : 'border-blue-200',
        text: theme === 'dark' ? 'text-blue-400' : 'text-blue-800',
        icon: 'text-blue-500'
      }
    };
    return colors[type] || colors.info;
  };

  const IconComponent = getIcon(notification.type);
  const colors = getColors(notification.type);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`relative max-w-sm w-full ${colors.bg} ${colors.border} border rounded-xl shadow-lg backdrop-blur-md p-4 mb-3`}
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${colors.icon}`}>
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="ml-3 flex-1">
          {notification.title && (
            <h4 className={`text-sm font-semibold ${colors.text} mb-1`}>
              {notification.title}
            </h4>
          )}
          <p className={`text-sm ${colors.text} opacity-90`}>
            {notification.message}
          </p>
        </div>
        {!notification.actions && (
          <button
            onClick={() => onClose(notification.id)}
            className={`ml-2 flex-shrink-0 ${colors.text} opacity-60 hover:opacity-100 transition-opacity`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Action Buttons for confirmation dialogs */}
      {notification.actions && (
        <div className="mt-4 flex gap-2">
          {notification.actions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                action.primary
                  ? theme === 'dark'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
      
      {/* Progress bar for auto-dismiss (only for non-action notifications) */}
      {notification.autoClose && !notification.actions && (
        <motion.div
          className={`absolute bottom-0 left-0 h-1 ${colors.icon} opacity-30 rounded-b-xl`}
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: notification.duration / 1000, ease: "linear" }}
        />
      )}
    </motion.div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      title: '',
      message: '',
      duration: 5000,
      autoClose: true,
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);

    if (newNotification.autoClose) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const success = useCallback((message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      title: options.title || 'Success',
      ...options,
    });
  }, [addNotification]);

  const error = useCallback((message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      title: options.title || 'Error',
      duration: 7000, // Longer duration for errors
      ...options,
    });
  }, [addNotification]);

  const warning = useCallback((message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      title: options.title || 'Warning',
      ...options,
    });
  }, [addNotification]);

  const info = useCallback((message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      title: options.title || 'Info',
      ...options,
    });
  }, [addNotification]);

  // Enhanced confirm dialog with better styling
  const confirm = useCallback(async (message, options = {}) => {
    return new Promise((resolve) => {
      const id = addNotification({
        type: 'warning',
        message,
        title: options.title || 'Confirm Action',
        autoClose: false,
        actions: [
          {
            label: options.cancelLabel || 'Cancel',
            action: () => {
              removeNotification(id);
              resolve(false);
            },
            primary: false
          },
          {
            label: options.confirmLabel || 'Confirm',
            action: () => {
              removeNotification(id);
              resolve(true);
            },
            primary: true
          }
        ],
        ...options,
      });
    });
  }, [addNotification, removeNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
    confirm,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map((notification) => (
            <div key={notification.id} className="pointer-events-auto">
              <NotificationItem
                notification={notification}
                onClose={removeNotification}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationContext;