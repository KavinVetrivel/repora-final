import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, Hash, Phone, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, loading } = useAuth();
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
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 sm:px-6 lg:px-8">
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
            Create your account
          </h2>
          <p className="text-dark-400">
            Join Repora to manage your class activities
          </p>
        </motion.div>

        {/* Registration Form */}
        <motion.form variants={itemVariants} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-dark-200 mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-dark-500" />
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
                className={`input pl-10 ${errors.name ? 'input-error' : ''}`}
                placeholder="Enter your full name"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>

          {/* Roll Number Field */}
          <div>
            <label htmlFor="rollNumber" className="block text-sm font-medium text-dark-200 mb-2">
              Roll Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-dark-500" />
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
                className={`input pl-10 ${errors.rollNumber ? 'input-error' : ''}`}
                placeholder="Enter your roll number"
              />
            </div>
            {errors.rollNumber && (
              <p className="mt-1 text-sm text-red-400">{errors.rollNumber.message}</p>
            )}
          </div>

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

          {/* Department Field */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-dark-200 mb-2">
              Department
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <GraduationCap className="h-5 w-5 text-dark-500" />
              </div>
              <select
                {...register('department', {
                  required: 'Department is required'
                })}
                className={`input pl-10 ${errors.department ? 'input-error' : ''}`}
              >
                <option value="">Select your department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Electronics Engineering">Electronics Engineering</option>
                <option value="Information Technology">Information Technology</option>
              </select>
            </div>
            {errors.department && (
              <p className="mt-1 text-sm text-red-400">{errors.department.message}</p>
            )}
          </div>

          {/* Year Field */}
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-dark-200 mb-2">
              Academic Year
            </label>
            <select
              {...register('year', {
                required: 'Year is required'
              })}
              className={`input ${errors.year ? 'input-error' : ''}`}
            >
              <option value="">Select your year</option>
              <option value="1st">1st Year</option>
              <option value="2nd">2nd Year</option>
              <option value="3rd">3rd Year</option>
              <option value="4th">4th Year</option>
              <option value="5th">5th Year</option>
            </select>
            {errors.year && (
              <p className="mt-1 text-sm text-red-400">{errors.year.message}</p>
            )}
          </div>

          {/* Role Field */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-dark-200 mb-2">
              Role
            </label>
            <select
              {...register('role', {
                required: 'Role is required'
              })}
              className={`input ${errors.role ? 'input-error' : ''}`}
            >
              <option value="">Select your role</option>
              <option value="student">Student (View Only Access)</option>
              <option value="class-representative">Class Representative (Full Access - Requires Approval)</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-400">{errors.role.message}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-dark-200 mb-2">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-dark-500" />
              </div>
              <input
                {...register('phone', {
                  pattern: {
                    value: /^[+]?[\d\s\-()]{10,15}$/,
                    message: 'Phone number must be 10-15 digits'
                  }
                })}
                type="tel"
                className={`input pl-10 ${errors.phone ? 'input-error' : ''}`}
                placeholder="Enter your phone number"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
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
                placeholder="Create a password"
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

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-200 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-dark-500" />
              </div>
              <input
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match'
                })}
                type="password"
                className={`input pl-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Confirm your password"
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                {...register('terms', {
                  required: 'You must accept the terms and conditions'
                })}
                type="checkbox"
                className="h-4 w-4 text-neon-blue focus:ring-neon-blue border-dark-600 rounded bg-dark-800"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-dark-300">
                I agree to the{' '}
                <a href="#" className="text-neon-blue hover:text-blue-400">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="text-neon-blue hover:text-blue-400">
                  Privacy Policy
                </a>
              </label>
              {errors.terms && (
                <p className="mt-1 text-sm text-red-400">{errors.terms.message}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full btn btn-primary py-3"
          >
            {loading || isSubmitting ? (
              <div className="w-5 h-5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              'Create Account'
            )}
          </button>
        </motion.form>

        {/* Login Link */}
        <motion.div variants={itemVariants} className="text-center">
          <p className="text-dark-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-neon-blue hover:text-blue-400 font-medium transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;





