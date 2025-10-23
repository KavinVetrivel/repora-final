// Basic Jest test to verify backend testing setup
describe('Backend Testing Setup', () => {
  test('Jest is working correctly', () => {
    expect(1 + 1).toBe(2);
  });

  test('can perform basic JavaScript operations', () => {
    const arr = [1, 2, 3];
    const doubled = arr.map(x => x * 2);
    
    expect(doubled).toEqual([2, 4, 6]);
  });

  test('async operations work', async () => {
    const promise = Promise.resolve('test');
    const result = await promise;
    
    expect(result).toBe('test');
  });

  test('can test object properties', () => {
    const user = {
      name: 'Test User',
      email: 'test@example.com',
      role: 'student'
    };

    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('role');
    expect(user.name).toBe('Test User');
  });

  test('can test arrays', () => {
    const items = ['apple', 'banana', 'orange'];
    
    expect(items).toHaveLength(3);
    expect(items).toContain('banana');
    expect(items[0]).toBe('apple');
  });

  test('environment variables work', () => {
    process.env.TEST_VAR = 'test-value';
    
    expect(process.env.TEST_VAR).toBe('test-value');
    
    delete process.env.TEST_VAR;
  });
});