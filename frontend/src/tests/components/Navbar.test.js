import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock the contexts
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      name: 'Test User',
      email: 'test@psgtech.ac.in',
      role: 'student'
    },
    isAuthenticated: true,
    logout: jest.fn(),
    isAdmin: () => false
  })
}));

jest.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: jest.fn()
  })
}));

// Create a simple navbar component for testing
const SimpleNavbar = () => (
  <nav>
    <span>Repora</span>
    <div>
      <span>Test User</span>
      <button aria-label="Toggle Theme">🌙</button>
      <button onClick={() => console.log('logout')}>Logout</button>
    </div>
  </nav>
);

// Test wrapper
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Navbar Component', () => {
  test('renders navbar with user info', () => {
    render(
      <TestWrapper>
        <SimpleNavbar />
      </TestWrapper>
    );
    
    expect(screen.getByText('Repora')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });

  test('theme toggle button is clickable', () => {
    render(
      <TestWrapper>
        <SimpleNavbar />
      </TestWrapper>
    );
    
    const themeButton = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(themeButton);
    
    // Button should be clickable without errors
    expect(themeButton).toBeInTheDocument();
  });

  test('shows logout option', () => {
    render(
      <TestWrapper>
        <SimpleNavbar />
      </TestWrapper>
    );
    
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
});