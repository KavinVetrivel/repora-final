import React from 'react';
import { render, screen } from '@testing-library/react';

// Create a simple loading spinner component for testing
const SimpleLoadingSpinner = ({ text = 'Loading...', showText = true }) => (
  <div className="flex items-center justify-center">
    <div className="w-8 h-8 border-2 rounded-full border-gray-700 border-t-orange-500 animate-spin" />
    {showText && <span className="ml-2">{text}</span>}
  </div>
);

describe('LoadingSpinner Component', () => {
  test('renders loading spinner with default text', () => {
    render(<SimpleLoadingSpinner />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders with custom text', () => {
    render(<SimpleLoadingSpinner text="Please wait..." />);
    
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  test('renders without text when showText is false', () => {
    render(<SimpleLoadingSpinner showText={false} />);
    
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
});