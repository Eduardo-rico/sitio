import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { normalizeUrlString, getSiteUrl } from '@/lib/site-url';

describe('site-url', () => {
  describe('normalizeUrlString', () => {
    it('should return null for null value', () => {
      // Arrange & Act
      const result = normalizeUrlString(null);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for undefined value', () => {
      // Arrange & Act
      const result = normalizeUrlString(undefined);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      // Arrange & Act
      const result = normalizeUrlString('');

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for whitespace-only string', () => {
      // Arrange & Act
      const result = normalizeUrlString('   ');

      // Assert
      expect(result).toBeNull();
    });

    it('should normalize URL with https protocol', () => {
      // Arrange
      const url = 'https://example.com';

      // Act
      const result = normalizeUrlString(url);

      // Assert
      expect(result).toBe('https://example.com');
    });

    it('should normalize URL with http protocol', () => {
      // Arrange
      const url = 'http://example.com';

      // Act
      const result = normalizeUrlString(url);

      // Assert
      expect(result).toBe('http://example.com');
    });

    it('should add https protocol to URL without protocol', () => {
      // Arrange
      const url = 'example.com';

      // Act
      const result = normalizeUrlString(url);

      // Assert
      expect(result).toBe('https://example.com');
    });

    it('should add https protocol to URL with trailing slashes', () => {
      // Arrange
      const url = 'example.com/';

      // Act
      const result = normalizeUrlString(url);

      // Assert
      expect(result).toBe('https://example.com');
    });

    it('should add https protocol to URL with multiple trailing slashes', () => {
      // Arrange
      const url = 'example.com///';

      // Act
      const result = normalizeUrlString(url);

      // Assert
      expect(result).toBe('https://example.com');
    });

    it('should use http protocol for localhost', () => {
      // Arrange
      const url = 'localhost:3000';

      // Act
      const result = normalizeUrlString(url);

      // Assert
      expect(result).toBe('http://localhost:3000');
    });

    it('should use http protocol for localhost without port', () => {
      // Arrange
      const url = 'localhost';

      // Act
      const result = normalizeUrlString(url);

      // Assert
      expect(result).toBe('http://localhost');
    });

    it('should use http protocol for 127.0.0.1', () => {
      // Arrange
      const url = '127.0.0.1:3000';

      // Act
      const result = normalizeUrlString(url);

      // Assert
      expect(result).toBe('http://127.0.0.1:3000');
    });

    it('should use http protocol for 127.0.0.1 without port', () => {
      // Arrange
      const url = '127.0.0.1';

      // Act
      const result = normalizeUrlString(url);

      // Assert
      expect(result).toBe('http://127.0.0.1');
    });

    it('should trim whitespace from URL', () => {
      // Arrange
      const url = '  example.com  ';

      // Act
      const result = normalizeUrlString(url);

      // Assert
      expect(result).toBe('https://example.com');
    });

    it('should return null for invalid URL', () => {
      // Arrange
      const url = 'not a valid url';

      // Act
      const result = normalizeUrlString(url);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for URL with only special characters', () => {
      // Arrange
      const url = '!!!@@@###';

      // Act
      const result = normalizeUrlString(url);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle URL with path', () => {
      // Arrange
      const url = 'example.com/path/to/resource';

      // Act
      const result = normalizeUrlString(url);

      // Assert
      expect(result).toBe('https://example.com/path/to/resource');
    });

    it('should handle URL with query parameters', () => {
      // Arrange
      const url = 'example.com?foo=bar';

      // Act
      const result = normalizeUrlString(url);

      // Assert
      expect(result).toBe('https://example.com/?foo=bar');
    });
  });

  describe('getSiteUrl', () => {
    beforeEach(() => {
      // Clear all environment variables before each test
      vi.stubEnv('SITE_URL', '');
      vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
      vi.stubEnv('AUTH_URL', '');
      vi.stubEnv('NEXTAUTH_URL', '');
      vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '');
      vi.stubEnv('VERCEL_URL', '');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('should return SITE_URL when defined', () => {
      // Arrange
      vi.stubEnv('SITE_URL', 'https://site.example.com');

      // Act
      const result = getSiteUrl();

      // Assert
      expect(result).toBe('https://site.example.com');
    });

    it('should return NEXT_PUBLIC_SITE_URL when SITE_URL is not defined', () => {
      // Arrange
      vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://next-public.example.com');

      // Act
      const result = getSiteUrl();

      // Assert
      expect(result).toBe('https://next-public.example.com');
    });

    it('should return AUTH_URL when SITE_URL and NEXT_PUBLIC_SITE_URL are not defined', () => {
      // Arrange
      vi.stubEnv('AUTH_URL', 'https://auth.example.com');

      // Act
      const result = getSiteUrl();

      // Assert
      expect(result).toBe('https://auth.example.com');
    });

    it('should return NEXTAUTH_URL when higher priority vars are not defined', () => {
      // Arrange
      vi.stubEnv('NEXTAUTH_URL', 'https://nextauth.example.com');

      // Act
      const result = getSiteUrl();

      // Assert
      expect(result).toBe('https://nextauth.example.com');
    });

    it('should return VERCEL_PROJECT_PRODUCTION_URL when higher priority vars are not defined', () => {
      // Arrange
      vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'https://vercel-prod.example.com');

      // Act
      const result = getSiteUrl();

      // Assert
      expect(result).toBe('https://vercel-prod.example.com');
    });

    it('should return VERCEL_URL when higher priority vars are not defined', () => {
      // Arrange
      vi.stubEnv('VERCEL_URL', 'https://vercel.example.com');

      // Act
      const result = getSiteUrl();

      // Assert
      expect(result).toBe('https://vercel.example.com');
    });

    it('should return default site URL when no environment variables are defined', () => {
      // Arrange - all env vars are cleared in beforeEach

      // Act
      const result = getSiteUrl();

      // Assert
      expect(result).toBe('https://www.ricosotomayor.com');
    });

    it('should prioritize SITE_URL over all other variables', () => {
      // Arrange
      vi.stubEnv('SITE_URL', 'https://site.example.com');
      vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://next-public.example.com');
      vi.stubEnv('AUTH_URL', 'https://auth.example.com');

      // Act
      const result = getSiteUrl();

      // Assert
      expect(result).toBe('https://site.example.com');
    });

    it('should skip invalid URLs and use next valid one', () => {
      // Arrange
      vi.stubEnv('SITE_URL', 'not a valid url');
      vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://valid.example.com');

      // Act
      const result = getSiteUrl();

      // Assert
      expect(result).toBe('https://valid.example.com');
    });

    it('should skip empty strings and use next valid one', () => {
      // Arrange
      vi.stubEnv('SITE_URL', '');
      vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
      vi.stubEnv('AUTH_URL', 'https://auth.example.com');

      // Act
      const result = getSiteUrl();

      // Assert
      expect(result).toBe('https://auth.example.com');
    });

    it('should normalize URLs from environment variables', () => {
      // Arrange
      vi.stubEnv('SITE_URL', 'example.com');

      // Act
      const result = getSiteUrl();

      // Assert
      expect(result).toBe('https://example.com');
    });

    it('should handle localhost in environment variables', () => {
      // Arrange
      vi.stubEnv('SITE_URL', 'localhost:3000');

      // Act
      const result = getSiteUrl();

      // Assert
      expect(result).toBe('http://localhost:3000');
    });
  });
});
