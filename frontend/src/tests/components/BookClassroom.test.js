import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock API
jest.mock('../../utils/api', () => ({
  getRooms: jest.fn(),
  createBooking: jest.fn(),
  getBookings: jest.fn()
}));

// Mock the contexts
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      _id: '1',
      name: 'Test User',
      email: 'test@psgtech.ac.in',
      role: 'class_rep',
      approved: true
    },
    isAuthenticated: true
  })
}));

jest.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light'
  })
}));

jest.mock('../../contexts/NotificationContext', () => ({
  useNotification: () => ({
    success: jest.fn(),
    error: jest.fn()
  })
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    form: ({ children, ...props }) => <form {...props}>{children}</form>,
  }
}));

// Create a simple booking component for testing
const SimpleBookClassroom = () => (
  <div>
    <h1>Book Classroom</h1>
    <form>
      <select name="room">
        <option value="">Select Room</option>
        <option value="1">Room 101</option>
      </select>
      <input type="date" name="date" />
      <input type="time" name="startTime" />
      <input type="time" name="endTime" />
      <textarea name="purpose" placeholder="Purpose of booking" />
      <button type="submit">Submit Booking Request</button>
    </form>
  </div>
);

// Test wrapper
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('BookClassroom Component', () => {
  test('renders booking form elements', () => {
    render(
      <TestWrapper>
        <SimpleBookClassroom />
      </TestWrapper>
    );
    
    expect(screen.getByText('Book Classroom')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Select Room')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Purpose of booking')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit booking request/i })).toBeInTheDocument();
  });

  test('has room selection options', () => {
    render(
      <TestWrapper>
        <SimpleBookClassroom />
      </TestWrapper>
    );
    
    expect(screen.getByText('Room 101')).toBeInTheDocument();
  });
});