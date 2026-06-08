import { describe, it, expect } from 'vitest';
import { getGreeting } from './context/AuthContext';

describe('Greeting Logic', () => {
  it('should include the role in greeting if provided', () => {
    const greeting = getGreeting('Alice', 'Admin');
    expect(greeting).toContain('Alice');
    expect(greeting).toContain('Admin');
  });

  it('should fallback gracefully if role is empty', () => {
    const greeting = getGreeting('Bob', '');
    expect(greeting).toContain('Bob');
  });
});
