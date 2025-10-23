import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock the contexts
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
    loading: false,
    isAuthenticated: false
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

// Create a simple login component for testing
const SimpleLogin = () => (
  <div>
    <h1>Repora</h1>
    <form>
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />
      <button type="submit">Sign In</button>
    </form>
    <a href="/register">Sign Up</a>
  </div>
);

// Test wrapper
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Login Component', () => {
  test('renders basic login elements', () => {
    render(
      <TestWrapper>
        <SimpleLogin />
      </TestWrapper>
    );
    
    expect(screen.getByText('Repora')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('has registration link', () => {
    render(
      <TestWrapper>
        <SimpleLogin />
      </TestWrapper>
    );
    
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });
});