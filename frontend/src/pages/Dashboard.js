import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import ReadOnlyStudentDashboard from '../components/dashboard/ReadOnlyStudentDashboard';

const Dashboard = () => {
  const { isAdmin, user } = useAuth();

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
    <div className="min-h-full bg-dark-950">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-dark-100">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-dark-400 mt-2">
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





