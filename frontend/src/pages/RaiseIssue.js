import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, FileText, ArrowLeft, Send, Upload, X } from 'lucide-react';
import { issueAPI } from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RaiseIssue = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium'
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'academic', label: 'Academic' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'hostel', label: 'Hostel' },
    { value: 'canteen', label: 'Canteen' },
    { value: 'transport', label: 'Transport' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const maxFiles = 5;
    const maxSize = 10 * 1024 * 1024; // 10MB

    // Validate file count
    if (files.length + selectedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file sizes
    const invalidFiles = selectedFiles.filter(file => file.size > maxSize);
    if (invalidFiles.length > 0) {
      alert('Some files are larger than 10MB and will be skipped');
      const validFiles = selectedFiles.filter(file => file.size <= maxSize);
      setFiles(prev => [...prev, ...validFiles]);
    } else {
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Please provide a title';
    if (formData.title.trim().length < 5) newErrors.title = 'Title must be at least 5 characters';
    if (!formData.description.trim()) newErrors.description = 'Please provide a description';
    if (formData.description.trim().length < 10) newErrors.description = 'Description must be at least 10 characters';
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('priority', formData.priority);
      
      // Append files
      files.forEach(file => {
        submitData.append('attachments', file);
      });

      await issueAPI.create(submitData);
      
      // Show success message and navigate back
      alert('Issue reported successfully! You can track its progress and resolution status in your issues.');
      navigate('/issues');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to submit issue';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-dark-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-dark-100">Report an Issue</h1>
            <p className="text-dark-400 mt-1">Submit an issue or request assistance</p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div variants={itemVariants} className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Issue Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Brief description of the issue (e.g., Broken projector in LAB101)"
                className={`input ${errors.title ? 'border-red-500' : ''}`}
                maxLength={100}
              />
              <p className="text-xs text-dark-500 mt-1">
                {formData.title.length}/100 characters
              </p>
              {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="input"
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Detailed Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Please provide a detailed description of the issue, including when it occurs, what you were trying to do, and any error messages you received."
                rows={5}
                className={`input resize-none ${errors.description ? 'border-red-500' : ''}`}
                maxLength={1000}
              />
              <p className="text-xs text-dark-500 mt-1">
                {formData.description.length}/1000 characters
              </p>
              {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                <Upload className="w-4 h-4 inline mr-2" />
                Attachments (Optional)
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed border-dark-600 rounded-lg cursor-pointer hover:border-dark-500 transition-colors"
                >
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-dark-400 mx-auto mb-2" />
                    <p className="text-sm text-dark-300">Click to upload files</p>
                    <p className="text-xs text-dark-500">Max 5 files, 10MB each</p>
                  </div>
                </label>

                {/* File List */}
                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-dark-800 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-dark-200 truncate">{file.name}</p>
                          <p className="text-xs text-dark-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="ml-2 p-1 text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center space-x-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex items-center"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Issue
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>

        {/* Information Card */}
        <motion.div variants={itemVariants} className="card p-4 bg-dark-800/50">
          <h3 className="text-sm font-medium text-dark-200 mb-2">Issue Reporting Guidelines</h3>
          <ul className="text-xs text-dark-400 space-y-1">
            <li>• Provide clear and detailed descriptions</li>
            <li>• Include relevant screenshots or documents when possible</li>
            <li>• Select appropriate category and priority level</li>
            <li>• You will receive updates via email and in-app notifications</li>
            <li>• High and urgent priority issues are addressed first</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RaiseIssue;