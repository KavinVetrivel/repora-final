import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, Hash, Phone, GraduationCap, Sun, Moon, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    // Remove fields that are not expected by the backend
    const { confirmPassword, terms, ...registrationData } = data;
    
    // Remove empty phone field to avoid validation issues
    if (!registrationData.phone || registrationData.phone.trim() === '') {
      delete registrationData.phone;
    }
    
    const result = await registerUser(registrationData);
    if (result.success) {
      if (result.needsApproval) {
        // Navigate to login page with a message about pending approval
        navigate('/login', { 
          state: { 
            message: 'Registration successful! Your account is pending admin approval.',
            type: 'info'
          }
        });
      } else {
        navigate('/dashboard');
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-orange-50 via-white to-orange-50'
    }`}>
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-full transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-white/10 hover:bg-white/20 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Back to Login */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          to="/login"
          className={`flex items-center space-x-2 p-3 rounded-full transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-white/10 hover:bg-white/20 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-2xl space-y-8"
        >
          {/* Logo and Header */}
          <motion.div 
            variants={logoVariants}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                {/* Logo Circle */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-orange-400 to-orange-600' 
                    : 'bg-gradient-to-br from-orange-300 to-orange-500'
                }`}>
                  {/* Inner decorative elements */}
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-white/30 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <h1 className={`text-4xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`} style={{ fontFamily: 'Inter, sans-serif' }}>
              Repora
            </h1>
            
            <h2 className={`text-xl font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Create your account
            </h2>
            
            <p className={`${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Join Repora to manage your academic resources
            </p>
          </motion.div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* First Row - Name and Roll Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    {...register('name', {
                      required: 'Name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters'
                      }
                    })}
                    type="text"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-200 ${
                      errors.name
                        ? theme === 'dark'
                          ? 'border-red-500 bg-red-500/5 text-red-400'
                          : 'border-red-300 bg-red-50 text-red-700'
                        : theme === 'dark'
                          ? 'border-gray-700 bg-gray-800/50 text-white focus:border-orange-400 focus:bg-gray-800'
                          : 'border-gray-200 bg-white text-gray-900 focus:border-orange-300 focus:ring-2 focus:ring-orange-100'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && (
                  <p className={`mt-2 text-sm ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Roll Number Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Roll Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Hash className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    {...register('rollNumber', {
                      required: 'Roll number is required',
                      minLength: {
                        value: 3,
                        message: 'Roll number must be at least 3 characters'
                      }
                    })}
                    type="text"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-200 ${
                      errors.rollNumber
                        ? theme === 'dark'
                          ? 'border-red-500 bg-red-500/5 text-red-400'
                          : 'border-red-300 bg-red-50 text-red-700'
                        : theme === 'dark'
                          ? 'border-gray-700 bg-gray-800/50 text-white focus:border-orange-400 focus:bg-gray-800'
                          : 'border-gray-200 bg-white text-gray-900 focus:border-orange-300 focus:ring-2 focus:ring-orange-100'
                    }`}
                    placeholder="Enter your roll number"
                  />
                </div>
                {errors.rollNumber && (
                  <p className={`mt-2 text-sm ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {errors.rollNumber.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@psgtech\.ac\.in$/i,
                      message: 'Email must be from @psgtech.ac.in domain'
                    }
                  })}
                  type="email"
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-200 ${
                    errors.email
                      ? theme === 'dark'
                        ? 'border-red-500 bg-red-500/5 text-red-400'
                        : 'border-red-300 bg-red-50 text-red-700'
                      : theme === 'dark'
                        ? 'border-gray-700 bg-gray-800/50 text-white focus:border-orange-400 focus:bg-gray-800'
                        : 'border-gray-200 bg-white text-gray-900 focus:border-orange-300 focus:ring-2 focus:ring-orange-100'
                  }`}
                  placeholder="Enter your @psgtech.ac.in email"
                />
              </div>
              {errors.email && (
                <p className={`mt-2 text-sm ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-600'
                }`}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Second Row - Department and Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Department
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <GraduationCap className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <select
                    {...register('department', {
                      required: 'Department is required'
                    })}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-200 ${
                      errors.department
                        ? theme === 'dark'
                          ? 'border-red-500 bg-red-500/5 text-red-400'
                          : 'border-red-300 bg-red-50 text-red-700'
                        : theme === 'dark'
                          ? 'border-gray-700 bg-gray-800/50 text-white focus:border-orange-400 focus:bg-gray-800'
                          : 'border-gray-200 bg-white text-gray-900 focus:border-orange-300 focus:ring-2 focus:ring-orange-100'
                    }`}
                  >
                    <option value="">Select department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Electronics Engineering">Electronics Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                  </select>
                </div>
                {errors.department && (
                  <p className={`mt-2 text-sm ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {errors.department.message}
                  </p>
                )}
              </div>

              {/* Year Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Academic Year
                </label>
                <select
                  {...register('year', {
                    required: 'Year is required'
                  })}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                    errors.year
                      ? theme === 'dark'
                        ? 'border-red-500 bg-red-500/5 text-red-400'
                        : 'border-red-300 bg-red-50 text-red-700'
                      : theme === 'dark'
                        ? 'border-gray-700 bg-gray-800/50 text-white focus:border-orange-400 focus:bg-gray-800'
                        : 'border-gray-200 bg-white text-gray-900 focus:border-orange-300 focus:ring-2 focus:ring-orange-100'
                  }`}
                >
                  <option value="">Select year</option>
                  <option value="1st">1st Year</option>
                  <option value="2nd">2nd Year</option>
                  <option value="3rd">3rd Year</option>
                  <option value="4th">4th Year</option>
                  <option value="5th">5th Year</option>
                </select>
                {errors.year && (
                  <p className={`mt-2 text-sm ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {errors.year.message}
                  </p>
                )}
              </div>
            </div>

            {/* Role Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Role
              </label>
              <select
                {...register('role', {
                  required: 'Role is required'
                })}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  errors.role
                    ? theme === 'dark'
                      ? 'border-red-500 bg-red-500/5 text-red-400'
                      : 'border-red-300 bg-red-50 text-red-700'
                    : theme === 'dark'
                      ? 'border-gray-700 bg-gray-800/50 text-white focus:border-orange-400 focus:bg-gray-800'
                      : 'border-gray-200 bg-white text-gray-900 focus:border-orange-300 focus:ring-2 focus:ring-orange-100'
                }`}
              >
                <option value="">Select your role</option>
                <option value="student">Student (View Only Access)</option>
                <option value="class-representative">Class Representative (Full Access - Requires Approval)</option>
              </select>
              {errors.role && (
                <p className={`mt-2 text-sm ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-600'
                }`}>
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Phone Number (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className={`h-5 w-5 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  {...register('phone', {
                    pattern: {
                      value: /^[+]?[\d\s\-()]{10,15}$/,
                      message: 'Phone number must be 10-15 digits'
                    }
                  })}
                  type="tel"
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-200 ${
                    errors.phone
                      ? theme === 'dark'
                        ? 'border-red-500 bg-red-500/5 text-red-400'
                        : 'border-red-300 bg-red-50 text-red-700'
                      : theme === 'dark'
                        ? 'border-gray-700 bg-gray-800/50 text-white focus:border-orange-400 focus:bg-gray-800'
                        : 'border-gray-200 bg-white text-gray-900 focus:border-orange-300 focus:ring-2 focus:ring-orange-100'
                  }`}
                  placeholder="Enter your phone number"
                />
              </div>
              {errors.phone && (
                <p className={`mt-2 text-sm ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-600'
                }`}>
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Third Row - Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
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
                    className={`w-full pl-12 pr-12 py-3 rounded-xl border transition-all duration-200 ${
                      errors.password
                        ? theme === 'dark'
                          ? 'border-red-500 bg-red-500/5 text-red-400'
                          : 'border-red-300 bg-red-50 text-red-700'
                        : theme === 'dark'
                          ? 'border-gray-700 bg-gray-800/50 text-white focus:border-orange-400 focus:bg-gray-800'
                          : 'border-gray-200 bg-white text-gray-900 focus:border-orange-300 focus:ring-2 focus:ring-orange-100'
                    }`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className={`h-5 w-5 ${
                        theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                      }`} />
                    ) : (
                      <Eye className={`h-5 w-5 ${
                        theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                      }`} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className={`mt-2 text-sm ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value => value === password || 'Passwords do not match'
                    })}
                    type="password"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-200 ${
                      errors.confirmPassword
                        ? theme === 'dark'
                          ? 'border-red-500 bg-red-500/5 text-red-400'
                          : 'border-red-300 bg-red-50 text-red-700'
                        : theme === 'dark'
                          ? 'border-gray-700 bg-gray-800/50 text-white focus:border-orange-400 focus:bg-gray-800'
                          : 'border-gray-200 bg-white text-gray-900 focus:border-orange-300 focus:ring-2 focus:ring-orange-100'
                    }`}
                    placeholder="Confirm your password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className={`mt-2 text-sm ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5">
                <input
                  {...register('terms', {
                    required: 'You must accept the terms and conditions'
                  })}
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                />
              </div>
              <div className="text-sm">
                <label className={`${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  I agree to the{' '}
                  <button
                    type="button"
                    className={`font-medium transition-colors ${
                      theme === 'dark'
                        ? 'text-orange-400 hover:text-orange-300'
                        : 'text-orange-600 hover:text-orange-500'
                    }`}
                  >
                    Terms and Conditions
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    className={`font-medium transition-colors ${
                      theme === 'dark'
                        ? 'text-orange-400 hover:text-orange-300'
                        : 'text-orange-600 hover:text-orange-500'
                    }`}
                  >
                    Privacy Policy
                  </button>
                </label>
                {errors.terms && (
                  <p className={`mt-1 text-sm ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {errors.terms.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                isSubmitting || loading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-[0.98] active:scale-[0.96]'
              } ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:from-orange-600 hover:to-orange-700'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:from-orange-600 hover:to-orange-700'
              }`}
            >
              {loading || isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center">
            <p className={`${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Already have an account?{' '}
              <Link
                to="/login"
                className={`font-medium transition-colors ${
                  theme === 'dark'
                    ? 'text-orange-400 hover:text-orange-300'
                    : 'text-orange-600 hover:text-orange-500'
                }`}
              >
                Sign in here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;






