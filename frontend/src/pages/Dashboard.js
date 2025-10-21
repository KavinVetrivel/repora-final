import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import ReadOnlyStudentDashboard from '../components/dashboard/ReadOnlyStudentDashboard';

const Dashboard = () => {
  const { isAdmin, user } = useAuth();
  const { theme } = useTheme();

  const getDashboardContent = () => {
    if (isAdmin()) {
      return <AdminDashboard />;
    } else if (user?.role === 'class-representative') {
      return <StudentDashboard />;
    } else {
      return <ReadOnlyStudentDashboard />;
    }
  };

  const getDashboardTitle = () => {
    if (isAdmin()) {
      return 'Manage your institution';
    } else if (user?.role === 'class-representative') {
      return 'Track your activities';
    } else {
      return 'View announcements and schedules';
    }
  };

  return (
    <div className={`min-h-full transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Welcome back, {user?.name}!
            </h1>
            <p className={`mt-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {getDashboardTitle()}
            </p>
          </div>

          {/* Dashboard Content */}
          {getDashboardContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;






