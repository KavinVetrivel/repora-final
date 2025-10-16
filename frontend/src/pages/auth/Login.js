import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';
  const stateMessage = location.state?.message;
  const messageType = location.state?.type;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();

  const onSubmit = async (data) => {
    const result = await login(data);
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-neon rounded-xl flex items-center justify-center">
                <span className="text-dark-950 font-bold text-xl">R</span>
              </div>
              <h1 className="text-3xl font-bold text-gradient">Repora</h1>
            </div>
            <h2 className="text-2xl font-semibold text-dark-100 mb-2">
              Welcome back
            </h2>
            <p className="text-dark-400">
              Sign in to your account to continue
            </p>
          </motion.div>

          {/* State Message */}
          {stateMessage && (
            <motion.div 
              variants={itemVariants} 
              className={`p-4 rounded-lg border ${
                messageType === 'info' 
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                  : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
              }`}
            >
              <p className="text-sm text-center">{stateMessage}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <motion.form variants={itemVariants} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-900/20 border border-red-500/30 rounded-lg p-3"
              >
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-dark-500" />
                </div>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-200 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-dark-500" />
                </div>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-dark-500 hover:text-dark-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-dark-500 hover:text-dark-300" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-neon-blue focus:ring-neon-blue border-dark-600 rounded bg-dark-800"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-dark-300">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="text-neon-blue hover:text-blue-400 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full btn btn-primary flex items-center justify-center space-x-2 py-3"
            >
              {loading || isSubmitting ? (
                <div className="w-5 h-5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.form>

          {/* Register Link */}
          <motion.div variants={itemVariants} className="text-center">
            <p className="text-dark-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-neon-blue hover:text-blue-400 font-medium transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-950 to-dark-950" />
        <div className="absolute inset-0 bg-gradient-to-tr from-neon-blue/10 via-transparent to-neon-purple/10" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 text-center space-y-8"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="w-32 h-32 mx-auto"
          >
            <div className="w-full h-full bg-gradient-neon rounded-full opacity-20 blur-xl" />
          </motion.div>
          
          <div className="space-y-4">
            <h3 className="text-3xl font-bold text-dark-100">
              Class Representative
            </h3>
            <h3 className="text-3xl font-bold text-gradient">
              Management System
            </h3>
            <p className="text-dark-400 max-w-md mx-auto">
              Streamline bookings, manage issues, and communicate announcements 
              all in one place.
            </p>
          </div>

          <div className="flex justify-center space-x-8 text-dark-500">
            <div className="text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-neon-blue" />
              <p className="text-sm">Smart Booking</p>
            </div>
            <div className="text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-neon-purple" />
              <p className="text-sm">Issue Tracking</p>
            </div>
            <div className="text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-neon-green" />
              <p className="text-sm">Announcements</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;





