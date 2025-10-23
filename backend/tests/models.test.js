const User = require('../models/User');
const bcrypt = require('bcryptjs');

describe('User Model', () => {
  describe('User creation', () => {
    test('should create a user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword123',
        rollNumber: 'CS001',
        department: 'Computer Science',
        year: 2,
        role: 'student'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.rollNumber).toBe(userData.rollNumber);
      expect(savedUser.status).toBe('pending'); // Default status
      expect(savedUser.createdAt).toBeDefined();
    });

    test('should fail to create user without required fields', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com'
        // Missing required fields
      };

      const user = new User(userData);
      
      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.name).toBe('ValidationError');
    });

    test('should fail to create user with duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword123',
        rollNumber: 'CS001',
        department: 'Computer Science',
        year: 2,
        role: 'student'
      };

      // Create first user
      const user1 = new User(userData);
      await user1.save();

      // Try to create second user with same email
      const user2 = new User({
        ...userData,
        rollNumber: 'CS002'
      });

      let error;
      try {
        await user2.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    });

    test('should fail to create user with duplicate roll number', async () => {
      const userData1 = {
        name: 'Test User 1',
        email: 'test1@example.com',
        password: 'hashedpassword123',
        rollNumber: 'CS001',
        department: 'Computer Science',
        year: 2,
        role: 'student'
      };

      const userData2 = {
        name: 'Test User 2',
        email: 'test2@example.com',
        password: 'hashedpassword123',
        rollNumber: 'CS001', // Same roll number
        department: 'Computer Science',
        year: 2,
        role: 'student'
      };

      // Create first user
      const user1 = new User(userData1);
      await user1.save();

      // Try to create second user with same roll number
      const user2 = new User(userData2);

      let error;
      try {
        await user2.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    });

    test('should validate email format', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email', // Invalid email format
        password: 'hashedpassword123',
        rollNumber: 'CS001',
        department: 'Computer Science',
        year: 2,
        role: 'student'
      };

      const user = new User(userData);
      
      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.name).toBe('ValidationError');
      expect(error.errors.email).toBeDefined();
    });

    test('should validate year range', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword123',
        rollNumber: 'CS001',
        department: 'Computer Science',
        year: 5, // Invalid year (should be 1-4)
        role: 'student'
      };

      const user = new User(userData);
      
      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.name).toBe('ValidationError');
      expect(error.errors.year).toBeDefined();
    });

    test('should validate role enum', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword123',
        rollNumber: 'CS001',
        department: 'Computer Science',
        year: 2,
        role: 'invalid-role' // Invalid role
      };

      const user = new User(userData);
      
      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.name).toBe('ValidationError');
      expect(error.errors.role).toBeDefined();
    });

    test('should validate status enum', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword123',
        rollNumber: 'CS001',
        department: 'Computer Science',
        year: 2,
        role: 'student',
        status: 'invalid-status' // Invalid status
      };

      const user = new User(userData);
      
      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.name).toBe('ValidationError');
      expect(error.errors.status).toBeDefined();
    });
  });

  describe('User methods', () => {
    test('should return user without password in JSON', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword123',
        rollNumber: 'CS001',
        department: 'Computer Science',
        year: 2,
        role: 'student'
      };

      const user = new User(userData);
      const savedUser = await user.save();
      
      const userJSON = savedUser.toJSON();
      
      expect(userJSON.password).toBeUndefined();
      expect(userJSON.name).toBe(userData.name);
      expect(userJSON.email).toBe(userData.email);
    });
  });

  describe('User queries', () => {
    beforeEach(async () => {
      // Create test users
      const users = [
        {
          name: 'Student 1',
          email: 'student1@example.com',
          password: 'hashedpassword123',
          rollNumber: 'CS001',
          department: 'Computer Science',
          year: 2,
          role: 'student',
          status: 'approved'
        },
        {
          name: 'Student 2',
          email: 'student2@example.com',
          password: 'hashedpassword123',
          rollNumber: 'CS002',
          department: 'Computer Science',
          year: 3,
          role: 'student',
          status: 'pending'
        },
        {
          name: 'CR 1',
          email: 'cr1@example.com',
          password: 'hashedpassword123',
          rollNumber: 'CS003',
          department: 'Computer Science',
          year: 2,
          role: 'class_representative',
          status: 'approved'
        },
        {
          name: 'Admin 1',
          email: 'admin1@example.com',
          password: 'hashedpassword123',
          rollNumber: 'ADMIN001',
          department: 'Administration',
          year: 1,
          role: 'admin',
          status: 'approved'
        }
      ];

      await User.insertMany(users);
    });

    test('should find users by role', async () => {
      const students = await User.find({ role: 'student' });
      const crs = await User.find({ role: 'class_representative' });
      const admins = await User.find({ role: 'admin' });

      expect(students).toHaveLength(2);
      expect(crs).toHaveLength(1);
      expect(admins).toHaveLength(1);
    });

    test('should find users by status', async () => {
      const approvedUsers = await User.find({ status: 'approved' });
      const pendingUsers = await User.find({ status: 'pending' });

      expect(approvedUsers).toHaveLength(3);
      expect(pendingUsers).toHaveLength(1);
    });

    test('should find users by department', async () => {
      const csUsers = await User.find({ department: 'Computer Science' });
      const adminUsers = await User.find({ department: 'Administration' });

      expect(csUsers).toHaveLength(3);
      expect(adminUsers).toHaveLength(1);
    });

    test('should find users by year', async () => {
      const year2Users = await User.find({ year: 2 });
      const year3Users = await User.find({ year: 3 });

      expect(year2Users).toHaveLength(2);
      expect(year3Users).toHaveLength(1);
    });

    test('should count users by role', async () => {
      const studentCount = await User.countDocuments({ role: 'student' });
      const crCount = await User.countDocuments({ role: 'class_representative' });
      const adminCount = await User.countDocuments({ role: 'admin' });

      expect(studentCount).toBe(2);
      expect(crCount).toBe(1);
      expect(adminCount).toBe(1);
    });
  });
});