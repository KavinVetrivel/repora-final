const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { bookingAPI } = require('../routes/bookings');
const Booking = require('../models/Booking');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Create Express app for testing
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/bookings', bookingAPI);
  return app;
};

// Helper function to create a test user and get auth token
const createTestUserAndToken = async (role = 'student') => {
  const user = new User({
    name: 'Test User',
    email: 'test@psgtech.ac.in',
    password: 'password123',
    rollNumber: 'CS001',
    department: 'Computer Science',
    year: '2nd',
    role: role,
    className: role === 'admin' ? undefined : 'G1',
    isApproved: true,
    isActive: true
  });
  
  await user.save();
  
  process.env.JWT_SECRET = 'test-secret';
  const token = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  return { user, token };
};

describe('Bookings API', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('POST /api/bookings', () => {
    test('should create a new booking successfully', async () => {
      const { user, token } = await createTestUserAndToken();
      
      const bookingData = {
        room: 'CS101',
        purpose: 'Study Group Meeting for exams',
        date: new Date('2099-12-01'),
        startTime: '10:00',
        endTime: '12:00'
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(bookingData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.booking).toBeDefined();
      expect(response.body.data.booking.room).toBe('CS101');
      expect(response.body.data.booking.purpose).toContain('Study Group');
      expect(response.body.data.booking.studentId).toBe(user._id.toString());
      expect(response.body.data.booking.status).toBe('pending');
    });

    test('should return 401 without authentication token', async () => {
      const bookingData = {
        room: 'CS101',
        purpose: 'Study Group Meeting',
        date: new Date('2099-12-01'),
        startTime: '10:00',
        endTime: '12:00'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData);

      expect(response.status).toBe(401);
    });

    test('should return 400 for missing required fields', async () => {
      const { token } = await createTestUserAndToken();
      
      const incompleteData = {
        room: 'CS101',
        purpose: 'Study Group Meeting'
        // Missing required fields: date, startTime, endTime
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(incompleteData);

      expect(response.status).toBe(400);
    });

    test('should return 400 for past date booking', async () => {
      const { token } = await createTestUserAndToken();
      
      const bookingData = {
        room: 'CS101',
        purpose: 'Study Group Meeting',
        date: new Date('2000-01-01'), // Past date
        startTime: '10:00',
        endTime: '12:00'
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(bookingData);

      expect(response.status).toBe(400);
  expect(response.body.message).toContain('past');
    });

    test('should return 400 for invalid time range', async () => {
      const { token } = await createTestUserAndToken();
      
      const bookingData = {
        room: 'CS101',
        purpose: 'Study Group Meeting',
        date: new Date('2099-12-01'),
        startTime: '14:00',
        endTime: '12:00' // End time before start time
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(bookingData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('time');
    });
  });

  describe('GET /api/bookings/my-bookings', () => {
    test('should return user bookings', async () => {
  const { user, token } = await createTestUserAndToken();
      
      // Create test bookings
      const booking1 = new Booking({
        studentId: user._id,
        studentRollNumber: 'CS001',
        studentName: user.name,
        room: 'CS101',
        purpose: 'Study Group 1',
        date: new Date('2099-12-01'),
        startTime: '10:00',
        endTime: '12:00',
        status: 'approved'
      });
      
      const booking2 = new Booking({
        studentId: user._id,
        studentRollNumber: 'CS001',
        studentName: user.name,
        room: 'CS102',
        purpose: 'Study Group 2',
        date: new Date('2099-12-02'),
        startTime: '14:00',
        endTime: '16:00',
        status: 'pending'
      });
      
      await booking1.save();
      await booking2.save();

      const response = await request(app)
        .get('/api/bookings/my-bookings')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
  expect(response.body.status).toBe('success');
  expect(response.body.data.bookings.length).toBe(2);
  expect(response.body.data.bookings[0].studentId.toString()).toBe(user._id.toString());
  expect(response.body.data.bookings[1].studentId.toString()).toBe(user._id.toString());
    });

    test('should return empty array for user with no bookings', async () => {
      const { token } = await createTestUserAndToken();

      const response = await request(app)
        .get('/api/bookings/my-bookings')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
  expect(response.body.status).toBe('success');
  expect(response.body.data.bookings).toHaveLength(0);
    });

    test('should filter bookings by status', async () => {
      const { user, token } = await createTestUserAndToken();
      
      const approvedBooking = new Booking({
        studentId: user._id,
        studentRollNumber: 'CS001',
        studentName: user.name,
        room: 'CS101',
        purpose: 'Approved Meeting',
        date: new Date('2099-12-01'),
        startTime: '10:00',
        endTime: '12:00',
        status: 'approved'
      });
      
      const pendingBooking = new Booking({
        studentId: user._id,
        studentRollNumber: 'CS001',
        studentName: user.name,
        room: 'CS102',
        purpose: 'Pending Meeting',
        date: new Date('2099-12-02'),
        startTime: '14:00',
        endTime: '16:00',
        status: 'pending'
      });
      
      await approvedBooking.save();
      await pendingBooking.save();

      const response = await request(app)
        .get('/api/bookings/my-bookings?status=approved')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
  expect(response.body.status).toBe('success');
  expect(response.body.data.bookings).toHaveLength(1);
  expect(response.body.data.bookings[0].status).toBe('approved');
    });
  });

  describe('GET /api/bookings/check-availability', () => {
    test('should return true for available time slot', async () => {
      const { token } = await createTestUserAndToken();

      const response = await request(app)
        .get('/api/bookings/check-availability')
        .query({
          room: 'CS101',
          date: '2099-12-01',
          startTime: '10:00',
          endTime: '12:00'
        })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.available).toBe(true);
    });

    test('should return false for conflicting time slot', async () => {
      const { user, token } = await createTestUserAndToken();
      
      // Create a conflicting booking
      const existingBooking = new Booking({
        studentId: user._id,
        studentRollNumber: 'CS001',
        studentName: user.name,
        room: 'CS101',
        purpose: 'Existing Meeting',
        date: new Date('2099-12-01'),
        startTime: '10:00',
        endTime: '12:00',
        status: 'approved'
      });
      
      await existingBooking.save();

      const response = await request(app)
        .get('/api/bookings/check-availability')
        .query({
          room: 'CS101',
          date: '2099-12-01',
          startTime: '11:00',
          endTime: '13:00'
        })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.available).toBe(false);
    });
  });

  describe('PATCH /api/bookings/:id/approve', () => {
    test('should approve booking as admin', async () => {
      const { user, token } = await createTestUserAndToken('admin');
      
      const booking = new Booking({
        studentId: user._id,
        studentRollNumber: 'CS001',
        studentName: user.name,
        room: 'CS101',
        purpose: 'Test Meeting',
        date: new Date('2099-12-01'),
        startTime: '10:00',
        endTime: '12:00',
        status: 'pending'
      });
      
      await booking.save();

      const response = await request(app)
        .patch(`/api/bookings/${booking._id}/approve`)
        .set('Authorization', `Bearer ${token}`)
        .send({ adminNotes: 'Looks good!' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.booking.status).toBe('approved');
      expect(response.body.data.booking.adminNotes).toBe('Looks good!');
    });

    test('should return 403 for non-admin user', async () => {
      const { user, token } = await createTestUserAndToken('student');
      
      const booking = new Booking({
        studentId: user._id,
        studentRollNumber: 'CS001',
        studentName: user.name,
        room: 'CS101',
        purpose: 'Test Meeting',
        date: new Date('2099-12-01'),
        startTime: '10:00',
        endTime: '12:00',
        status: 'pending'
      });
      
      await booking.save();

      const response = await request(app)
        .patch(`/api/bookings/${booking._id}/approve`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
    });
  });
});