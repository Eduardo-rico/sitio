import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('normalize-auth-url-env', () => {
  beforeEach(() => {
    // Reset modules cache to allow re-executing the module
    vi.resetModules();
    
    // Clear all environment variables before each test
    vi.stubEnv('AUTH_URL', '');
    vi.stubEnv('NEXTAUTH_URL', '');
    vi.stubEnv('NEXTAUTH_URL_INTERNAL', '');
    vi.stubEnv('VERCEL_URL', '');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '');
    vi.stubEnv('AUTH_SECRET', '');
    vi.stubEnv('NEXTAUTH_SECRET', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('URL normalization', () => {
    it('should normalize URLs in all urlVars variables', async () => {
      // Arrange
      vi.stubEnv('AUTH_URL', 'example.com/');
      vi.stubEnv('NEXTAUTH_URL', 'myapp.com///');
      vi.stubEnv('NEXTAUTH_URL_INTERNAL', 'internal.app.com');
      vi.stubEnv('VERCEL_URL', 'vercel.app.com/');
      vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'prod.app.com//');

      // Act - import the module to trigger the function
      await import('@/lib/normalize-auth-url-env');

      // Assert
      expect(process.env.AUTH_URL).toBe('https://example.com');
      expect(process.env.NEXTAUTH_URL).toBe('https://myapp.com');
      expect(process.env.NEXTAUTH_URL_INTERNAL).toBe('https://internal.app.com');
      expect(process.env.VERCEL_URL).toBe('https://vercel.app.com');
      expect(process.env.VERCEL_PROJECT_PRODUCTION_URL).toBe('https://prod.app.com');
    });

    it('should handle localhost URLs with http protocol', async () => {
      // Arrange
      vi.stubEnv('AUTH_URL', 'localhost:3000/');
      vi.stubEnv('NEXTAUTH_URL', '127.0.0.1:3000');

      // Act
      await import('@/lib/normalize-auth-url-env');

      // Assert
      expect(process.env.AUTH_URL).toBe('http://localhost:3000');
      expect(process.env.NEXTAUTH_URL).toBe('http://127.0.0.1:3000');
    });

    it('should not modify undefined environment variables', async () => {
      // Arrange - all URL vars are undefined/empty

      // Act
      await import('@/lib/normalize-auth-url-env');

      // Assert
      expect(process.env.AUTH_URL).toBe('');
      expect(process.env.NEXTAUTH_URL).toBe('');
      expect(process.env.NEXTAUTH_URL_INTERNAL).toBe('');
    });

    it('should not overwrite already normalized URLs', async () => {
      // Arrange
      vi.stubEnv('AUTH_URL', 'https://example.com');
      vi.stubEnv('NEXTAUTH_URL', 'https://myapp.com');

      // Act
      await import('@/lib/normalize-auth-url-env');

      // Assert
      expect(process.env.AUTH_URL).toBe('https://example.com');
      expect(process.env.NEXTAUTH_URL).toBe('https://myapp.com');
    });
  });

  describe('AUTH_URL and NEXTAUTH_URL synchronization', () => {
    it('should set AUTH_URL from NEXTAUTH_URL when AUTH_URL is empty', async () => {
      // Arrange
      vi.stubEnv('AUTH_URL', '');
      vi.stubEnv('NEXTAUTH_URL', 'https://existing.example.com');

      // Act
      await import('@/lib/normalize-auth-url-env');

      // Assert
      expect(process.env.AUTH_URL).toBe('https://existing.example.com');
      expect(process.env.NEXTAUTH_URL).toBe('https://existing.example.com');
    });

    it('should set NEXTAUTH_URL from AUTH_URL when NEXTAUTH_URL is empty', async () => {
      // Arrange
      vi.stubEnv('AUTH_URL', 'https://auth.example.com');
      vi.stubEnv('NEXTAUTH_URL', '');

      // Act
      await import('@/lib/normalize-auth-url-env');

      // Assert
      expect(process.env.AUTH_URL).toBe('https://auth.example.com');
      expect(process.env.NEXTAUTH_URL).toBe('https://auth.example.com');
    });

    it('should not change either when both are already set', async () => {
      // Arrange
      vi.stubEnv('AUTH_URL', 'https://auth.example.com');
      vi.stubEnv('NEXTAUTH_URL', 'https://nextauth.example.com');

      // Act
      await import('@/lib/normalize-auth-url-env');

      // Assert
      expect(process.env.AUTH_URL).toBe('https://auth.example.com');
      expect(process.env.NEXTAUTH_URL).toBe('https://nextauth.example.com');
    });

    it('should sync after normalization', async () => {
      // Arrange
      vi.stubEnv('AUTH_URL', '');
      vi.stubEnv('NEXTAUTH_URL', 'myapp.com/');

      // Act
      await import('@/lib/normalize-auth-url-env');

      // Assert - both should be the normalized version
      expect(process.env.AUTH_URL).toBe('https://myapp.com');
      expect(process.env.NEXTAUTH_URL).toBe('https://myapp.com');
    });
  });

  describe('Fallback URLs', () => {
    it('should use VERCEL_PROJECT_PRODUCTION_URL as fallback when AUTH_URL is empty', async () => {
      // Arrange
      vi.stubEnv('AUTH_URL', '');
      vi.stubEnv('NEXTAUTH_URL', '');
      vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'https://prod.vercel.app');

      // Act
      await import('@/lib/normalize-auth-url-env');

      // Assert
      expect(process.env.AUTH_URL).toBe('https://prod.vercel.app');
      expect(process.env.NEXTAUTH_URL).toBe('https://prod.vercel.app');
    });

    it('should use VERCEL_URL as fallback when AUTH_URL and VERCEL_PROJECT_PRODUCTION_URL are empty', async () => {
      // Arrange
      vi.stubEnv('AUTH_URL', '');
      vi.stubEnv('NEXTAUTH_URL', '');
      vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '');
      vi.stubEnv('VERCEL_URL', 'https://my-app.vercel.app');

      // Act
      await import('@/lib/normalize-auth-url-env');

      // Assert
      expect(process.env.AUTH_URL).toBe('https://my-app.vercel.app');
      expect(process.env.NEXTAUTH_URL).toBe('https://my-app.vercel.app');
    });

    it('should prefer VERCEL_PROJECT_PRODUCTION_URL over VERCEL_URL as fallback', async () => {
      // Arrange
      vi.stubEnv('AUTH_URL', '');
      vi.stubEnv('NEXTAUTH_URL', '');
      vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'https://prod.example.com');
      vi.stubEnv('VERCEL_URL', 'https://preview.example.com');

      // Act
      await import('@/lib/normalize-auth-url-env');

      // Assert
      expect(process.env.AUTH_URL).toBe('https://prod.example.com');
      expect(process.env.NEXTAUTH_URL).toBe('https://prod.example.com');
    });

    it('should normalize fallback URLs before setting them', async () => {
      // Arrange
      vi.stubEnv('AUTH_URL', '');
      vi.stubEnv('NEXTAUTH_URL', '');
      vi.stubEnv('VERCEL_URL', 'my-app.vercel.app/');

      // Act
      await import('@/lib/normalize-auth-url-env');

      // Assert
      expect(process.env.AUTH_URL).toBe('https://my-app.vercel.app');
      expect(process.env.NEXTAUTH_URL).toBe('https://my-app.vercel.app');
    });

    it('should not use fallback when AUTH_URL is already set', async () => {
      // Arrange
      vi.stubEnv('AUTH_URL', 'https://auth.example.com');
      vi.stubEnv('VERCEL_URL', 'https://vercel.example.com');

      // Act
      await import('@/lib/normalize-auth-url-env');

      // Assert
      expect(process.env.AUTH_URL).toBe('https://auth.example.com');
    });

    it('should handle localhost in fallback URLs', async () => {
      // Arrange
      vi.stubEnv('AUTH_URL', '');
      vi.stubEnv('NEXTAUTH_URL', '');
      vi.stubEnv('VERCEL_URL', 'localhost:3000');

      // Act
      await import('@/lib/normalize-auth-url-env');

      // Assert
      expect(process.env.AUTH_URL).toBe('http://localhost:3000');
      expect(process.env.NEXTAUTH_URL).toBe('http://localhost:3000');
    });
  });

  describe('Secret synchronization', () => {
    it('should set AUTH_SECRET from NEXTAUTH_SECRET when AUTH_SECRET is empty', async () => {
      // Arrange
      vi.stubEnv('AUTH_SECRET', '');
      vi.stubEnv('NEXTAUTH_SECRET', 'my-secret-key');

      // Act
      await import('@/lib/normalize-auth-url-env');

      // Assert
      expect(process.env.AUTH_SECRET).toBe('my-secret-key');
      expect(process.env.NEXTAUTH_SECRET).toBe('my-secret-key');
    });

    it('should set NEXTAUTH_SECRET from AUTH_SECRET when NEXTAUTH_SECRET is empty', async () => {
      // Arrange
      vi.stubEnv('AUTH_SECRET', 'another-secret');
      vi.stubEnv('NEXTAUTH_SECRET', '');

      // Act
      await import('@/lib/normalize-auth-url-env');

      // Assert
      expect(process.env.AUTH_SECRET).toBe('another-secret');
      expect(process.env.NEXTAUTH_SECRET).toBe('another-secret');
    });

    it('should not change secrets when both are already set', async () => {
      // Arrange
      vi.stubEnv('AUTH_SECRET', 'auth-secret');
      vi.stubEnv('NEXTAUTH_SECRET', 'nextauth-secret');

      // Act
      await import('@/lib/normalize-auth-url-env');

      // Assert
      expect(process.env.AUTH_SECRET).toBe('auth-secret');
      expect(process.env.NEXTAUTH_SECRET).toBe('nextauth-secret');
    });

    it('should handle secrets with special characters', async () => {
      // Arrange
      vi.stubEnv('AUTH_SECRET', '');
      vi.stubEnv('NEXTAUTH_SECRET', 's3cr3t!@#$%^&*()_+-=[]{}|;:,.<>?');

      // Act
      await import('@/lib/normalize-auth-url-env');

      // Assert
      expect(process.env.AUTH_SECRET).toBe('s3cr3t!@#$%^&*()_+-=[]{}|;:,.<>?');
    });
  });

  describe('Edge cases', () => {
    it('should handle all URL variables being undefined', async () => {
      // Arrange - all empty

      // Act
      await import('@/lib/normalize-auth-url-env');

      // Assert - should remain empty
      expect(process.env.AUTH_URL).toBe('');
      expect(process.env.NEXTAUTH_URL).toBe('');
      expect(process.env.NEXTAUTH_URL_INTERNAL).toBe('');
    });

    it('should handle whitespace-only URLs as invalid', async () => {
      // Arrange
      vi.stubEnv('AUTH_URL', '   ');
      vi.stubEnv('NEXTAUTH_URL', '   ');
      vi.stubEnv('VERCEL_URL', 'https://fallback.example.com');

      // Act
      await import('@/lib/normalize-auth-url-env');

      // Assert - whitespace is treated as having a value (truthy), so fallback is not used
      // and normalizeUrlString returns null, leaving the original value unchanged
      expect(process.env.AUTH_URL).toBe('   ');
      expect(process.env.NEXTAUTH_URL).toBe('   ');
    });

    it('should handle URLs with paths', async () => {
      // Arrange
      vi.stubEnv('AUTH_URL', 'example.com/api/auth');

      // Act
      await import('@/lib/normalize-auth-url-env');

      // Assert
      expect(process.env.AUTH_URL).toBe('https://example.com/api/auth');
    });

    it('should handle URLs with query parameters', async () => {
      // Arrange
      vi.stubEnv('AUTH_URL', 'example.com?foo=bar');

      // Act
      await import('@/lib/normalize-auth-url-env');

      // Assert
      expect(process.env.AUTH_URL).toBe('https://example.com/?foo=bar');
    });
  });
});
