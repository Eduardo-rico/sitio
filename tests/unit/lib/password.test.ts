import { describe, it, expect, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import { hashPassword, verifyPassword } from '@/lib/password';

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

describe('password', () => {
  describe('hashPassword', () => {
    it('should hash a password with bcrypt using 12 salt rounds', async () => {
      // Arrange
      const password = 'mySecurePassword123';
      const expectedHash = 'hashedPassword123';
      vi.mocked(bcrypt.hash).mockResolvedValue(expectedHash as never);

      // Act
      const result = await hashPassword(password);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(result).toBe(expectedHash);
    });

    it('should generate different hashes for the same password', async () => {
      // Arrange
      const password = 'mySecurePassword123';
      const hash1 = 'hash1abc';
      const hash2 = 'hash2xyz';
      vi.mocked(bcrypt.hash)
        .mockResolvedValueOnce(hash1 as never)
        .mockResolvedValueOnce(hash2 as never);

      // Act
      const result1 = await hashPassword(password);
      const result2 = await hashPassword(password);

      // Assert
      expect(result1).not.toBe(result2);
    });

    it('should handle empty password', async () => {
      // Arrange
      const password = '';
      const expectedHash = 'emptyHash';
      vi.mocked(bcrypt.hash).mockResolvedValue(expectedHash as never);

      // Act
      const result = await hashPassword(password);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(result).toBe(expectedHash);
    });

    it('should handle long passwords', async () => {
      // Arrange
      const password = 'a'.repeat(1000);
      const expectedHash = 'longHash';
      vi.mocked(bcrypt.hash).mockResolvedValue(expectedHash as never);

      // Act
      const result = await hashPassword(password);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(result).toBe(expectedHash);
    });
  });

  describe('verifyPassword', () => {
    it('should return true when password matches hash', async () => {
      // Arrange
      const password = 'mySecurePassword123';
      const hashedPassword = 'hashedPassword123';
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      // Act
      const result = await verifyPassword(password, hashedPassword);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false when password does not match hash', async () => {
      // Arrange
      const password = 'wrongPassword';
      const hashedPassword = 'hashedPassword123';
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      // Act
      const result = await verifyPassword(password, hashedPassword);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
    });

    it('should handle empty password', async () => {
      // Arrange
      const password = '';
      const hashedPassword = 'hashedPassword123';
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      // Act
      const result = await verifyPassword(password, hashedPassword);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
    });

    it('should handle empty hash', async () => {
      // Arrange
      const password = 'mySecurePassword123';
      const hashedPassword = '';
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      // Act
      const result = await verifyPassword(password, hashedPassword);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
    });

    it('should handle special characters in password', async () => {
      // Arrange
      const password = '!@#$%^&*()_+{}|:<>?~`-=[]\\;\',./"';
      const hashedPassword = 'hashedPassword123';
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      // Act
      const result = await verifyPassword(password, hashedPassword);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });
  });
});
