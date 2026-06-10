import { describe, it, expect } from 'vitest';
import { getGreeting } from './context/AuthContext';

describe('Greeting Logic', () => {
  it('should include the first name in greeting if provided', () => {
    const greeting = getGreeting('Alice', 'Admin');
    expect(greeting).toContain('Alice');
  });

  it('should use role in greeting if first name is missing', () => {
    const greeting = getGreeting('', 'Admin');
    expect(greeting).toContain('Admin');
  });

  it('should fallback gracefully if both name and role are empty', () => {
    const greeting = getGreeting('', '');
    expect(greeting).not.toContain(',');
  });
});
