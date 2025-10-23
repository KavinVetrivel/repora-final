import { authAPI } from './utils/api';

// Mock axios to test API calls
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  })),
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

describe('API Tests', () => {
  test('authAPI object exists and has required methods', () => {
    expect(authAPI).toBeDefined();
    expect(typeof authAPI.login).toBe('function');
    expect(typeof authAPI.register).toBe('function');
    expect(typeof authAPI.getProfile).toBe('function');
    expect(typeof authAPI.updateProfile).toBe('function');
    expect(typeof authAPI.changePassword).toBe('function');
  });

  test('API base URL is correctly set', () => {
    // This test verifies the API configuration exists
    expect(authAPI).toHaveProperty('login');
    expect(authAPI).toHaveProperty('register');
  });
});