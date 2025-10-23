const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Mock Express request and response objects
const mockRequest = (token = null) => ({
  header: jest.fn().mockReturnValue(token ? `Bearer ${token}` : null),
  user: null
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  test('should authenticate valid token', async () => {
    // Create a test user
    const testUser = {
      _id: 'user123',
      email: 'test@example.com',
      role: 'student'
    };

    // Create a valid token
    const token = jwt.sign(
      { userId: testUser._id, email: testUser.email, role: testUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Mock User.findById to return our test user
    jest.spyOn(User, 'findById').mockResolvedValue(testUser);

    const req = mockRequest(token);
    const res = mockResponse();

    await auth(req, res, mockNext);

    expect(req.user).toEqual(testUser);
    expect(mockNext).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test('should return 401 when no token provided', async () => {
    const req = mockRequest(null);
    const res = mockResponse();

    await auth(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token, authorization denied' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('should return 401 when token is malformed', async () => {
    const req = mockRequest('invalid-token');
    const res = mockResponse();

    await auth(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token is not valid' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('should return 401 when token is expired', async () => {
    // Create an expired token
    const expiredToken = jwt.sign(
      { userId: 'user123', email: 'test@example.com', role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '-1h' } // Expired 1 hour ago
    );

    const req = mockRequest(expiredToken);
    const res = mockResponse();

    await auth(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token is not valid' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('should return 401 when user not found', async () => {
    const token = jwt.sign(
      { userId: 'nonexistent-user', email: 'test@example.com', role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Mock User.findById to return null (user not found)
    jest.spyOn(User, 'findById').mockResolvedValue(null);

    const req = mockRequest(token);
    const res = mockResponse();

    await auth(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token is not valid' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('should handle database errors', async () => {
    const token = jwt.sign(
      { userId: 'user123', email: 'test@example.com', role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Mock User.findById to throw an error
    jest.spyOn(User, 'findById').mockRejectedValue(new Error('Database error'));

    const req = mockRequest(token);
    const res = mockResponse();

    await auth(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('should extract token from Bearer header correctly', async () => {
    const testUser = {
      _id: 'user123',
      email: 'test@example.com',
      role: 'student'
    };

    const token = jwt.sign(
      { userId: testUser._id, email: testUser.email, role: testUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    jest.spyOn(User, 'findById').mockResolvedValue(testUser);

    // Test with proper Bearer token format
    const req = {
      header: jest.fn().mockReturnValue(`Bearer ${token}`),
      user: null
    };
    const res = mockResponse();

    await auth(req, res, mockNext);

    expect(req.header).toHaveBeenCalledWith('Authorization');
    expect(req.user).toEqual(testUser);
    expect(mockNext).toHaveBeenCalledWith();
  });

  test('should return 401 when Authorization header does not start with Bearer', async () => {
    const token = jwt.sign(
      { userId: 'user123', email: 'test@example.com', role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Test with wrong header format
    const req = {
      header: jest.fn().mockReturnValue(`Basic ${token}`), // Wrong format
      user: null
    };
    const res = mockResponse();

    await auth(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token, authorization denied' });
    expect(mockNext).not.toHaveBeenCalled();
  });
});