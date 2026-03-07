import { describe, it, expect } from 'vitest';
import authConfig from '@/lib/auth.config';

describe('auth.config', () => {
  describe('configuration', () => {
    it('should have trustHost set to true', () => {
      // Assert
      expect(authConfig.trustHost).toBe(true);
    });

    it('should have providers as an empty array', () => {
      // Assert
      expect(authConfig.providers).toEqual([]);
    });

    it('should have signIn page set to "/auth/signin"', () => {
      // Assert
      expect(authConfig.pages?.signIn).toBe('/auth/signin');
    });
  });

  describe('jwt callback', () => {
    it('should add user role to token when user is provided', () => {
      // Arrange
      const token = { sub: 'user123' };
      const user = { id: 'user123', role: 'admin' };

      // Act
      const result = authConfig.callbacks?.jwt({
        token,
        user,
        account: null,
        profile: undefined,
        trigger: 'signIn',
        session: undefined,
      });

      // Assert
      expect(result.role).toBe('admin');
    });

    it('should use "user" as default role when user has no role', () => {
      // Arrange
      const token = { sub: 'user123' };
      const user = { id: 'user123' };

      // Act
      const result = authConfig.callbacks?.jwt({
        token,
        user,
        account: null,
        profile: undefined,
        trigger: 'signIn',
        session: undefined,
      });

      // Assert
      expect(result.role).toBe('user');
    });

    it('should return token unchanged when no user is provided', () => {
      // Arrange
      const token = { sub: 'user123', role: 'admin' };

      // Act
      const result = authConfig.callbacks?.jwt({
        token,
        user: undefined,
        account: null,
        profile: undefined,
        trigger: 'update',
        session: undefined,
      });

      // Assert
      expect(result).toEqual(token);
    });
  });

  describe('session callback', () => {
    it('should assign token id to session user', () => {
      // Arrange
      const session = {
        user: { id: 'oldId', name: 'Test User', email: 'test@example.com' },
        expires: '2024-12-31T23:59:59.999Z',
      };
      const token = { sub: 'newId123', role: 'admin' };

      // Act
      const result = authConfig.callbacks?.session({
        session,
        token,
        user: undefined,
        newSession: undefined,
        trigger: 'update',
      });

      // Assert
      expect(result.user?.id).toBe('newId123');
    });

    it('should keep existing id when token.sub is not available', () => {
      // Arrange
      const session = {
        user: { id: 'existingId', name: 'Test User', email: 'test@example.com' },
        expires: '2024-12-31T23:59:59.999Z',
      };
      const token = { role: 'admin' };

      // Act
      const result = authConfig.callbacks?.session({
        session,
        token,
        user: undefined,
        newSession: undefined,
        trigger: 'update',
      });

      // Assert
      expect(result.user?.id).toBe('existingId');
    });

    it('should assign token role to session user', () => {
      // Arrange
      const session = {
        user: { id: 'user123', name: 'Test User', email: 'test@example.com' },
        expires: '2024-12-31T23:59:59.999Z',
      };
      const token = { sub: 'user123', role: 'admin' };

      // Act
      const result = authConfig.callbacks?.session({
        session,
        token,
        user: undefined,
        newSession: undefined,
        trigger: 'update',
      });

      // Assert
      expect(result.user?.role).toBe('admin');
    });

    it('should use "user" as default role when token has no role', () => {
      // Arrange
      const session = {
        user: { id: 'user123', name: 'Test User', email: 'test@example.com' },
        expires: '2024-12-31T23:59:59.999Z',
      };
      const token = { sub: 'user123' };

      // Act
      const result = authConfig.callbacks?.session({
        session,
        token,
        user: undefined,
        newSession: undefined,
        trigger: 'update',
      });

      // Assert
      expect(result.user?.role).toBe('user');
    });

    it('should return session unchanged when session.user is not defined', () => {
      // Arrange
      const session = {
        expires: '2024-12-31T23:59:59.999Z',
      };
      const token = { sub: 'user123', role: 'admin' };

      // Act
      const result = authConfig.callbacks?.session({
        session: session as { user?: { id?: string; role?: string }; expires: string },
        token,
        user: undefined,
        newSession: undefined,
        trigger: 'update',
      });

      // Assert
      expect(result).toEqual(session);
    });
  });
});
