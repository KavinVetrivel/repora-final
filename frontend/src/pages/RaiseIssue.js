import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { roomsAPI, issueAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// College blocks and their floors (matching BookClassroom structure)
const COLLEGE_BLOCKS = {
  'A': { name: 'A Block', floors: [1, 2, 3, 4, 5] },
  'B': { name: 'B Block', floors: [1, 2, 3, 4] },
  'C': { name: 'C Block', floors: [1, 2, 3] },
  'D': { name: 'D Block', floors: [1, 2, 3, 4] },
  'E': { name: 'E Block', floors: [1, 2] }
};

// Rooms per floor (matching BookClassroom structure)
const ROOMS_PER_FLOOR = {
  1: Array.from({ length: 12 }, (_, i) => i + 1),
  2: Array.from({ length: 15 }, (_, i) => i + 1),
  3: Array.from({ length: 15 }, (_, i) => i + 1),
  4: Array.from({ length: 10 }, (_, i) => i + 1),
  5: Array.from({ length: 8 }, (_, i) => i + 1)
};

const initialState = {
  block: '',
  floor: '',
  roomNumber: '',
  room: '',
  title: '',
  description: '',
  priority: 'medium',
  selectedComponents: []
};

const RaiseIssue = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [formData, setFormData] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [loadingComponents, setLoadingComponents] = useState(false);
  const [roomComponents, setRoomComponents] = useState([]);

  const generateRoomCode = (block, floor, roomNumber) => {
    if (!block || !floor || !roomNumber) return '';
    const paddedRoom = roomNumber.toString().padStart(2, '0');
    return `${block}${floor}${paddedRoom}`;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (['block', 'floor', 'roomNumber'].includes(name)) {
        updated.room = generateRoomCode(
          name === 'block' ? value : prev.block,
          name === 'floor' ? value : prev.floor,
          name === 'roomNumber' ? value : prev.roomNumber
        );
        
        if (name === 'block') {
          updated.floor = '';
          updated.roomNumber = '';
          updated.room = '';
          setRoomComponents([]);
          updated.selectedComponents = [];
        }
        
        if (name === 'floor') {
          updated.roomNumber = '';
          updated.room = generateRoomCode(prev.block, value, '');
          setRoomComponents([]);
          updated.selectedComponents = [];
        }

        if (name === 'roomNumber') {
          updated.selectedComponents = [];
        }
      }

      return updated;
    });
  };

  useEffect(() => {
    if (formData.room) {
      fetchRoomComponents(formData.room);
    } else {
      setRoomComponents([]);
    }
  }, [formData.room]);

  const fetchRoomComponents = async (roomCode) => {
    try {
      setLoadingComponents(true);
      const response = await roomsAPI.getRoomComponents(roomCode);
      if (response.data.status === 'success') {
        const allComponents = [];
        Object.entries(response.data.data.componentsByCategory).forEach(([category, components]) => {
          components.forEach(component => {
            allComponents.push({
              ...component,
              category,
              displayName: `${component.name} (${category})`
            });
          });
        });
        setRoomComponents(allComponents);
      }
    } catch (error) {
      console.error('Error fetching room components:', error);
      toast.error('Failed to load room equipment. Please try again.');
      setRoomComponents([]);
    } finally {
      setLoadingComponents(false);
    }
  };

  const handleComponentSelect = (componentId) => {
    const component = roomComponents.find(c => c.id === componentId);
    if (!component) return;

    setFormData(prev => {
      const isAlreadySelected = prev.selectedComponents.some(c => c.id === componentId);
      
      if (isAlreadySelected) {
        return {
          ...prev,
          selectedComponents: prev.selectedComponents.filter(c => c.id !== componentId)
        };
      } else {
        return {
          ...prev,
          selectedComponents: [...prev.selectedComponents, {
            id: component.id,
            name: component.name,
            category: component.category
          }]
        };
      }
    });
  };



  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    // Debug: Log form data
    console.log('Form data before submission:', formData);

    // Validate title length (backend requires at least 5 characters)
    if (!formData.title.trim() || formData.title.trim().length < 5) {
      toast.error('Issue title must be at least 5 characters long');
      setSubmitting(false);
      return;
    }

    if (formData.description.length < 10) {
      toast.error('Issue description must be at least 10 characters long');
      setSubmitting(false);
      return;
    }

    if (!formData.room) {
      toast.error('Please select a room');
      setSubmitting(false);
      return;
    }

    if (formData.selectedComponents.length === 0) {
      toast.error('Please select at least one equipment/component');
      setSubmitting(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('priority', formData.priority);
      
      // Set room fields according to backend validation expectations
      submitData.append('room[id]', formData.room);
      submitData.append('room[name]', `Room ${formData.room}`);
      submitData.append('room[description]', `${formData.block} Block, Floor ${formData.floor}, Room ${formData.roomNumber}`);
      
      // Set components according to backend validation expectations
      formData.selectedComponents.forEach((component, index) => {
        submitData.append(`affectedComponents[${index}][id]`, component.id);
        submitData.append(`affectedComponents[${index}][name]`, component.name);
        submitData.append(`affectedComponents[${index}][category]`, component.category);
        submitData.append(`affectedComponents[${index}][count]`, '1');
      });



      // Debug: Log FormData contents
      console.log('FormData contents:');
      for (let pair of submitData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await issueAPI.create(submitData);
      
      if (response.data.status === 'success') {
        toast.success('Issue raised successfully! You can track its status in the issues page.');
        setFormData(initialState);
        navigate('/issues');
      }
    } catch (error) {
      console.error('Submit error:', error);
      console.error('Error response:', error.response?.data);
      const message = error.response?.data?.message || 'Failed to submit issue';
      
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(e => `${e.path}: ${e.msg}`).join(', ');
        toast.error(`Validation failed: ${errorMessages}`);
      } else {
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-full ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="mb-8">
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Raise an Issue</h1>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              Report equipment issues, maintenance requests, and facility problems.
            </p>
          </div>

          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm p-8`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Information Section */}
              <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} pb-6 mb-6`}>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Roll Number
                    </label>
                    <input
                      type="text"
                      className={`input ${theme === 'dark' ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300'}`}
                      value={user?.rollNumber || ''}
                      disabled
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Name
                    </label>
                    <input
                      type="text"
                      className={`input ${theme === 'dark' ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300'}`}
                      value={user?.name || ''}
                      disabled
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Department & Year
                    </label>
                    <input
                      type="text"
                      className={`input ${theme === 'dark' ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300'}`}
                      value={user ? `${user.department} - Year ${user.year}` : ''}
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Room Selection Section */}
              <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} pb-6 mb-6`}>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Classroom Selection</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`} htmlFor="block">
                      Block
                    </label>
                    <select
                      id="block"
                      name="block"
                      className="input"
                      value={formData.block}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Block</option>
                      {Object.entries(COLLEGE_BLOCKS).map(([block, info]) => (
                        <option key={block} value={block}>
                          {info.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`} htmlFor="floor">
                      Floor
                    </label>
                    <select
                      id="floor"
                      name="floor"
                      className="input"
                      value={formData.floor}
                      onChange={handleChange}
                      disabled={!formData.block}
                      required
                    >
                      <option value="">Select Floor</option>
                      {formData.block && COLLEGE_BLOCKS[formData.block]?.floors.map(floor => (
                        <option key={floor} value={floor}>
                          Floor {floor}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`} htmlFor="roomNumber">
                      Room Number
                    </label>
                    <select
                      id="roomNumber"
                      name="roomNumber"
                      className="input"
                      value={formData.roomNumber}
                      onChange={handleChange}
                      disabled={!formData.floor}
                      required
                    >
                      <option value="">Select Room</option>
                      {formData.floor && ROOMS_PER_FLOOR[parseInt(formData.floor)]?.map(room => (
                        <option key={room} value={room}>
                          Room {room.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Room Code
                    </label>
                    <div className={`input ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-900 border-gray-300'} font-mono text-lg flex items-center justify-center`}>
                      {formData.room || 'XXX'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipment Selection Section */}
              {formData.room && (
                <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} pb-6 mb-6`}>
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
                    Equipment & Components 
                    {loadingComponents && <LoadingSpinner size="sm" className="ml-2 inline" />}
                  </h3>
                  
                  {roomComponents.length > 0 ? (
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Select Affected Equipment ({formData.selectedComponents.length} selected)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {roomComponents.map((component) => {
                            const isSelected = formData.selectedComponents.some(c => c.id === component.id);
                            return (
                              <div 
                                key={component.id} 
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                  isSelected 
                                    ? 'border-blue-500 bg-blue-900/20 text-blue-300' 
                                    : theme === 'dark'
                                    ? 'border-gray-600 hover:border-gray-500 text-gray-300'
                                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                                }`}
                                onClick={() => handleComponentSelect(component.id)}
                              >
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleComponentSelect(component.id)}
                                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <div>
                                    <span className="font-medium">{component.name}</span>
                                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} block`}>
                                      Category: {component.category} • Total: {component.count}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Selected Components Display */}
                      {formData.selectedComponents.length > 0 && (
                        <div className={`mt-4 p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}>
                          <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Selected Equipment:</h4>
                          <div className="flex flex-wrap gap-2">
                            {formData.selectedComponents.map((component) => (
                              <span 
                                key={component.id}
                                className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm flex items-center"
                              >
                                {component.name}
                                <button
                                  type="button"
                                  onClick={() => handleComponentSelect(component.id)}
                                  className="ml-2 text-blue-400 hover:text-blue-200"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : !loadingComponents ? (
                    <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <p>No equipment data available for this room.</p>
                      <p className="text-sm mt-1">Please contact the administrator if this seems incorrect.</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <LoadingSpinner size="md" />
                      <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-2`}>Loading room equipment...</p>
                    </div>
                  )}
                </div>
              )}

              {/* Issue Details Section */}
              <div>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Issue Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`} htmlFor="title">
                        Issue Title *
                      </label>
                      <input
                        id="title"
                        name="title"
                        type="text"
                        className="input"
                        placeholder="Brief summary of the issue"
                        value={formData.title}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`} htmlFor="priority">
                        Priority Level
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        className="input"
                        value={formData.priority}
                        onChange={handleChange}
                        required
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`} htmlFor="description">
                      Detailed Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows="4"
                      className={`input ${formData.description.length < 10 ? 'border-red-500' : ''}`}
                      placeholder="Provide detailed description of the issue, including any error messages or symptoms (minimum 10 characters)"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                    <p className={`text-sm mt-1 ${
                      formData.description.length < 10 
                        ? 'text-red-400' 
                        : formData.description.length > 1000 
                        ? 'text-yellow-400' 
                        : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {formData.description.length}/1000 characters {formData.description.length < 10 && '(minimum 10 required)'}
                    </p>
                  </div>


                </div>
              </div>

              {/* Submit Section */}
              <div className={`flex justify-between items-center pt-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p>• Your issue will be submitted for admin review</p>
                  <p>• You can track the status in your issues page</p>
                  <p>• Provide as much detail as possible for faster resolution</p>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary flex items-center"
                  disabled={submitting || !formData.room || formData.selectedComponents.length === 0}
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Submitting...</span>
                    </>
                  ) : (
                    'Submit Issue Report'
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RaiseIssue;