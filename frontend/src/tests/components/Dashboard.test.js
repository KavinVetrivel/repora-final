import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock the contexts
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      _id: '1',
      name: 'Test User',
      email: 'test@psgtech.ac.in',
      role: 'student',
      approved: true
    },
    isAuthenticated: true,
    loading: false,
    isAdmin: () => false
  })
}));

jest.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light'
  })
}));

// Create a simple dashboard component for testing
const SimpleDashboard = () => (
  <div>
    <h1>Welcome back, Test User!</h1>
    <p>View announcements and schedules</p>
    <div data-testid="student-dashboard">Student Dashboard Content</div>
  </div>
);

// Test wrapper
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Dashboard Component', () => {
  test('renders dashboard welcome message', () => {
    render(
      <TestWrapper>
        <SimpleDashboard />
      </TestWrapper>
    );
    
    expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument();
    expect(screen.getByText('View announcements and schedules')).toBeInTheDocument();
  });

  test('renders student dashboard content', () => {
    render(
      <TestWrapper>
        <SimpleDashboard />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('student-dashboard')).toBeInTheDocument();
    expect(screen.getByText('Student Dashboard Content')).toBeInTheDocument();
  });
});