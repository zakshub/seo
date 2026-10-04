import { describe, expect, it } from 'vitest';
import { isOwnerAuthenticated } from './owner-auth.js';

describe('local owner authentication', () => {
  it('refuses absent or incorrect credentials', () => {
    expect(isOwnerAuthenticated(undefined, undefined)).toBe(false);
    expect(isOwnerAuthenticated('secret', undefined)).toBe(false);
    expect(isOwnerAuthenticated('secret', 'wrong')).toBe(false);
  });
  it('accepts only the configured owner token', () => {
    expect(isOwnerAuthenticated('secret', 'secret')).toBe(true);
  });
});
