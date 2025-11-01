const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { authAPI } = require('../routes/auth');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create Express app for testing
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', authAPI);
  return app;
};

describe('Authentication API', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@psgtech.ac.in',
        password: 'password123',
        rollNumber: 'CS001',
        department: 'Computer Science',
        year: '2nd',
        role: 'student',
        className: 'G1'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message.toLowerCase()).toContain('registration successful');
      
      // Verify user was created in database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.rollNumber).toBe(userData.rollNumber);
    });

    test('should return 400 for missing required fields', async () => {
      const incompleteData = {
        name: 'Test User',
        email: 'test@psgtech.ac.in'
        // Missing password and other required fields
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    test('should return 400 for duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@psgtech.ac.in',
        password: 'password123',
        rollNumber: 'CS001',
        department: 'Computer Science',
        year: '2nd',
        role: 'student',
        className: 'G1'
      };

      // Create user first time
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Try to create same user again
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already exists');
    });

    test('should hash password before saving', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@psgtech.ac.in',
        password: 'password123',
        rollNumber: 'CS001',
        department: 'Computer Science',
        year: '2nd',
        role: 'student',
        className: 'G1'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const user = await User.findOne({ email: userData.email });
      expect(user.password).not.toBe(userData.password);
      
      // Verify password is properly hashed
      const isValidPassword = await bcrypt.compare(userData.password, user.password);
      expect(isValidPassword).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test (password hashed by model)
      const testUser = new User({
        name: 'Test User',
        email: 'test@psgtech.ac.in',
        password: 'password123',
        rollNumber: 'CS001',
        department: 'Computer Science',
        year: '2nd',
        role: 'student',
        className: 'G1',
        isApproved: true,
        isActive: true
      });
      await testUser.save();
    });

    test('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@psgtech.ac.in',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

  expect(response.status).toBe(200);
  expect(response.body.data).toHaveProperty('token');
  expect(response.body.data).toHaveProperty('user');
  expect(response.body.data.user.email).toBe(loginData.email);
  expect(response.body.data.user).not.toHaveProperty('password');
    });

    test('should return 401 for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@psgtech.ac.in',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

  expect(response.status).toBe(401);
  expect(response.body.message).toContain('Invalid email or password');
    });

    test('should return 401 for invalid password', async () => {
      const loginData = {
        email: 'test@psgtech.ac.in',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

  expect(response.status).toBe(401);
  expect(response.body.message).toContain('Invalid email or password');
    });

    test('should return 401 for pending user status', async () => {
      // Create a pending user
      const pendingUser = new User({
        name: 'Pending User',
        email: 'pending@psgtech.ac.in',
        password: 'password123',
        rollNumber: 'CS002',
        department: 'Computer Science',
        year: '2nd',
        role: 'class-representative',
        className: 'G1',
        isApproved: false
      });
      await pendingUser.save();

      const loginData = {
        email: 'pending@psgtech.ac.in',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

  expect(response.status).toBe(401);
  expect(response.body.message.toLowerCase()).toContain('pending admin approval');
    });

    test('should return valid JWT token', async () => {
      const loginData = {
        email: 'test@psgtech.ac.in',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      
      const token = response.body.data.token;
      expect(token).toBeTruthy();
      
      // Verify token can be decoded (you'll need to set JWT_SECRET in test env)
      process.env.JWT_SECRET = 'test-secret';
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded).toHaveProperty('userId');
      // email is not included in generateToken payload in app; ensure userId exists
    });
  });
});