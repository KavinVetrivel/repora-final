import React from 'react';
import { render, screen } from '@testing-library/react';

// Simple smoke test to verify Jest is working
describe('Basic Test Suite', () => {
  test('Jest is working correctly', () => {
    expect(1 + 1).toBe(2);
  });

  test('can render a simple React component', () => {
    const TestComponent = () => <div>Hello Test</div>;
    render(<TestComponent />);
    expect(screen.getByText('Hello Test')).toBeInTheDocument();
  });

  test('string operations work', () => {
    const str = 'Repora Testing';
    expect(str).toContain('Repora');
    expect(str.length).toBe(14);
  });

  test('array operations work', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });

  test('object operations work', () => {
    const user = { name: 'Admin', email: 'admin@psgtech.ac.in' };
    expect(user).toHaveProperty('name');
    expect(user.email).toContain('@psgtech.ac.in');
  });
});