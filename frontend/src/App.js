import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';

// Components
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute';
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ApiTest from './components/debug/ApiTest';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Issues from './pages/Issues';
import Announcements from './pages/Announcements';
import Profile from './pages/Profile';
import BookClassroom from './pages/BookClassroom';
import RaiseIssue from './pages/RaiseIssue';
import ApproveBookings from './pages/admin/ApproveBookings';
import ApproveIssues from './pages/admin/ApproveIssues';
import ManageUsers from './pages/admin/ManageUsers';
import ApproveUsers from './pages/admin/ApproveUsers';
import NotFound from './pages/NotFound';

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 0.98
  }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

function App() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <AnimatePresence mode="wait">
          <Routes>
            {/* Debug Route */}
            <Route path="/api-test" element={<ApiTest />} />
            
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Login />
                  </motion.div>
                )
              } 
            />
            <Route 
              path="/register" 
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Register />
                  </motion.div>
                )
              } 
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route 
                path="dashboard" 
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Dashboard />
                  </motion.div>
                } 
              />
              <Route 
                path="bookings" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin', 'class-representative']}>
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Bookings />
                    </motion.div>
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path="issues" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin', 'class-representative']}>
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Issues />
                    </motion.div>
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path="announcements" 
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Announcements />
                  </motion.div>
                } 
              />
              <Route 
                path="profile" 
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Profile />
                  </motion.div>
                } 
              />
              <Route 
                path="book-classroom" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin', 'class-representative']}>
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <BookClassroom />
                    </motion.div>
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path="raise-issue" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin', 'class-representative']}>
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <RaiseIssue />
                    </motion.div>
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path="admin/approve-bookings" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <ApproveBookings />
                    </motion.div>
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path="admin/approve-issues" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <ApproveIssues />
                    </motion.div>
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path="admin/manage-users" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <ManageUsers />
                    </motion.div>
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path="admin/approve-users" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <ApproveUsers />
                    </motion.div>
                  </RoleProtectedRoute>
                } 
              />
            </Route>

            {/* 404 Route */}
            <Route 
              path="*" 
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <NotFound />
                </motion.div>
              } 
            />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;





