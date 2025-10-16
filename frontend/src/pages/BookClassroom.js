import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { bookingAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

// College blocks and their floors
const COLLEGE_BLOCKS = {
  'A': { name: 'A Block', floors: [1, 2, 3, 4, 5] },
  'B': { name: 'B Block', floors: [1, 2, 3, 4] },
  'C': { name: 'C Block', floors: [1, 2, 3] },
  'D': { name: 'D Block', floors: [1, 2, 3, 4] },
  'E': { name: 'E Block', floors: [1, 2] }
};

// Rooms per floor (typically 10-20 rooms per floor)
const ROOMS_PER_FLOOR = {
  1: Array.from({ length: 12 }, (_, i) => i + 1), // Floor 1: rooms 01-12
  2: Array.from({ length: 15 }, (_, i) => i + 1), // Floor 2: rooms 01-15
  3: Array.from({ length: 15 }, (_, i) => i + 1), // Floor 3: rooms 01-15
  4: Array.from({ length: 10 }, (_, i) => i + 1), // Floor 4: rooms 01-10
  5: Array.from({ length: 8 }, (_, i) => i + 1)   // Floor 5: rooms 01-08
};

const initialState = {
  block: '',
  floor: '',
  roomNumber: '',
  room: '', // Generated from block + floor + roomNumber
  date: '',
  startTime: '',
  endTime: '',
  purpose: ''
};

const BookClassroom = () => {
  const [formData, setFormData] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState(null);
  const [existingBookings, setExistingBookings] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const generateRoomCode = (block, floor, roomNumber) => {
    if (!block || !floor || !roomNumber) return '';
    const paddedRoom = roomNumber.toString().padStart(2, '0');
    return `${block}${floor}${paddedRoom}`;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value
      };

      // Auto-generate room code when block, floor, or roomNumber changes
      if (['block', 'floor', 'roomNumber'].includes(name)) {
        updated.room = generateRoomCode(
          name === 'block' ? value : prev.block,
          name === 'floor' ? value : prev.floor,
          name === 'roomNumber' ? value : prev.roomNumber
        );
        
        // Reset floor and room when block changes
        if (name === 'block') {
          updated.floor = '';
          updated.roomNumber = '';
          updated.room = '';
        }
        
        // Reset room when floor changes
        if (name === 'floor') {
          updated.roomNumber = '';
          updated.room = generateRoomCode(prev.block, value, '');
        }
      }

      return updated;
    });

    // Clear availability status when room details change
    if (['block', 'floor', 'roomNumber', 'date', 'startTime', 'endTime'].includes(name)) {
      setAvailabilityStatus(null);
    }
  };

  const checkRoomAvailability = useCallback(async () => {
    if (!formData.room || !formData.date || !formData.startTime || !formData.endTime) {
      toast.error('Please fill in room, date, start time, and end time to check availability');
      return;
    }

    setCheckingAvailability(true);
    try {
      // Check availability for the selected room, date, and time
      const response = await bookingAPI.checkAvailability({
        room: formData.room,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime
      });
      
      const { available, existingBookings, conflictingBooking } = response.data.data;
      setExistingBookings(existingBookings || []);

      if (available) {
        setAvailabilityStatus({
          status: 'available',
          message: 'Room is available for booking!'
        });
      } else {
        setAvailabilityStatus({
          status: 'occupied',
          message: 'Room is not available for the selected time',
          conflictingBooking
        });
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Failed to check room availability');
      setAvailabilityStatus({
        status: 'error',
        message: 'Could not check availability. Please try again.'
      });
    } finally {
      setCheckingAvailability(false);
    }
  }, [formData.room, formData.date, formData.startTime, formData.endTime]);

  // Auto-check availability when room and time details are complete
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.room && formData.date && formData.startTime && formData.endTime) {
        checkRoomAvailability();
      }
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timer);
  }, [formData.room, formData.date, formData.startTime, formData.endTime, checkRoomAvailability]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    // Validate form data before submission
    if (formData.purpose.length < 10) {
      toast.error('Purpose must be at least 10 characters long');
      setSubmitting(false);
      return;
    }
    
    if (formData.endTime <= formData.startTime) {
      toast.error('End time must be after start time');
      setSubmitting(false);
      return;
    }

    try {
      
      const bookingData = {
        room: formData.room,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose
      };
      
      console.log('📤 Booking data being sent:', bookingData);
      await bookingAPI.create(bookingData);

      toast.success('Booking request submitted successfully! You can track its status in your bookings.');
      setFormData(initialState);
      navigate('/bookings');
    } catch (error) {
      console.error('❌ Booking error:', error.response?.data || error.message);
      const message = error.response?.data?.message || 'Failed to create booking';
      
      // Show validation errors if available
      if (error.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors);
        toast.error(`Validation failed: ${error.response.data.errors.map(e => e.msg).join(', ')}`);
      } else {
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-dark-950">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-dark-100">Book a Classroom</h1>
            <p className="text-dark-400 mt-2">
              Reserve classrooms and labs for presentations, study sessions, and events.
            </p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Information Section */}
              <div className="border-b border-dark-800 pb-6 mb-6">
                <h3 className="text-lg font-semibold text-dark-200 mb-4">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Roll Number
                    </label>
                    <input
                      type="text"
                      className="input bg-dark-800 text-dark-300"
                      value={user?.rollNumber || ''}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      className="input bg-dark-800 text-dark-300"
                      value={user?.name || ''}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Department & Year
                    </label>
                    <input
                      type="text"
                      className="input bg-dark-800 text-dark-300"
                      value={user ? `${user.department} - Year ${user.year}` : ''}
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Room Selection Section */}
              <div className="border-b border-dark-800 pb-6 mb-6">
                <h3 className="text-lg font-semibold text-dark-200 mb-4">Classroom Selection</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2" htmlFor="block">
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
                    <label className="block text-sm font-medium text-dark-300 mb-2" htmlFor="floor">
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
                    <label className="block text-sm font-medium text-dark-300 mb-2" htmlFor="roomNumber">
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
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Room Code
                    </label>
                    <div className="input bg-dark-800 text-dark-100 font-mono text-lg flex items-center justify-center">
                      {formData.room || 'XXX'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Date and Time Section */}
              <div className="border-b border-dark-800 pb-6 mb-6">
                <h3 className="text-lg font-semibold text-dark-200 mb-4">Booking Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2" htmlFor="date">
                      Date
                    </label>
                    <input
                      id="date"
                      name="date"
                      type="date"
                      className="input"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2" htmlFor="startTime">
                      Start Time
                    </label>
                    <input
                      id="startTime"
                      name="startTime"
                      type="time"
                      className="input"
                      value={formData.startTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2" htmlFor="endTime">
                      End Time
                    </label>
                    <input
                      id="endTime"
                      name="endTime"
                      type="time"
                      className="input"
                      value={formData.endTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Availability Status */}
                {formData.room && formData.date && formData.startTime && formData.endTime && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-dark-300">Room Availability</span>
                      <button
                        type="button"
                        onClick={checkRoomAvailability}
                        className="btn btn-sm btn-outline"
                        disabled={checkingAvailability}
                      >
                        {checkingAvailability ? (
                          <>
                            <LoadingSpinner size="xs" />
                            <span className="ml-1">Checking...</span>
                          </>
                        ) : (
                          'Check Again'
                        )}
                      </button>
                    </div>
                    
                    {availabilityStatus && (
                      <div className={`p-4 rounded-lg border ${
                        availabilityStatus.status === 'available' 
                          ? 'bg-green-900/20 border-green-700 text-green-300'
                          : availabilityStatus.status === 'occupied'
                          ? 'bg-red-900/20 border-red-700 text-red-300' 
                          : 'bg-yellow-900/20 border-yellow-700 text-yellow-300'
                      }`}>
                        <div className="flex items-center mb-2">
                          {availabilityStatus.status === 'available' ? (
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                          ) : availabilityStatus.status === 'occupied' ? (
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                          ) : (
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                          )}
                          <span className="font-medium">
                            {availabilityStatus.status === 'available' ? 'Available' : 
                             availabilityStatus.status === 'occupied' ? 'Not Available' : 'Status Unknown'}
                          </span>
                        </div>
                        <p className="text-sm">{availabilityStatus.message}</p>
                        
                        {availabilityStatus.conflictingBooking && (
                          <div className="mt-3 p-3 bg-dark-800 rounded-lg">
                            <p className="text-xs text-dark-400 mb-1">Conflicting booking:</p>
                            <p className="text-sm">
                              <span className="font-medium">{availabilityStatus.conflictingBooking.studentName}</span> 
                              {' '}({availabilityStatus.conflictingBooking.studentRollNumber})
                            </p>
                            <p className="text-sm text-dark-300">
                              {availabilityStatus.conflictingBooking.startTime} - {availabilityStatus.conflictingBooking.endTime}
                            </p>
                            <p className="text-xs text-dark-400 capitalize">
                              Status: {availabilityStatus.conflictingBooking.status}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Show existing bookings for the day */}
                    {existingBookings.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-dark-300 mb-2">
                          Other bookings for {formData.room} on this day:
                        </p>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {existingBookings.map(booking => (
                            <div key={booking._id} className="p-2 bg-dark-800 rounded text-sm">
                              <div className="flex justify-between items-center">
                                <span>
                                  {booking.startTime} - {booking.endTime}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  booking.status === 'approved' 
                                    ? 'bg-green-900 text-green-300'
                                    : booking.status === 'pending'
                                    ? 'bg-yellow-900 text-yellow-300'
                                    : 'bg-red-900 text-red-300'
                                }`}>
                                  {booking.status}
                                </span>
                              </div>
                              <p className="text-dark-400 text-xs mt-1">
                                {booking.studentName} ({booking.studentRollNumber})
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Purpose Section */}
              <div>
                <h3 className="text-lg font-semibold text-dark-200 mb-4">Purpose & Additional Details</h3>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2" htmlFor="purpose">
                    Purpose of Booking
                  </label>
                  <textarea
                    id="purpose"
                    name="purpose"
                    rows="4"
                    className={`input ${formData.purpose.length < 10 ? 'border-red-500' : ''}`}
                    placeholder="Describe the event or activity in detail (minimum 10 characters)"
                    value={formData.purpose}
                    onChange={handleChange}
                    required
                  />
                  <p className={`text-sm mt-1 ${
                    formData.purpose.length < 10 
                      ? 'text-red-400' 
                      : formData.purpose.length > 500 
                      ? 'text-yellow-400' 
                      : 'text-dark-400'
                  }`}>
                    {formData.purpose.length}/500 characters {formData.purpose.length < 10 && '(minimum 10 required)'}
                  </p>
                </div>
              </div>

              {/* Submit Section */}
              <div className="flex justify-between items-center pt-6 border-t border-dark-800">
                <div className="text-sm text-dark-400">
                  <p>• Your booking will be submitted for admin approval</p>
                  <p>• You can track the status in your bookings page</p>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary flex items-center"
                  disabled={submitting || (availabilityStatus && availabilityStatus.status === 'occupied')}
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Submitting...</span>
                    </>
                  ) : (
                    'Submit Booking Request'
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

export default BookClassroom;
