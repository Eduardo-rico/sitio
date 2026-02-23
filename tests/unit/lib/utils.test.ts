import { describe, it, expect } from 'vitest';
import { cn, getGradientFromString, getInitials } from '@/components/ui/utils';
import getFormattedDate from '@/lib/getFormattedDate';

describe('utils', () => {
  describe('cn (className utility)', () => {
    it('should merge tailwind classes correctly', () => {
      // Arrange & Act
      const result = cn('px-2 py-1', 'px-4');

      // Assert - px-4 should override px-2
      expect(result).toBe('py-1 px-4');
    });

    it('should handle conditional classes', () => {
      // Arrange & Act
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class');

      // Assert
      expect(result).toBe('base-class active-class');
    });

    it('should handle falsy values', () => {
      // Arrange & Act
      const result = cn('base-class', null, undefined, false, 'active-class');

      // Assert
      expect(result).toBe('base-class active-class');
    });

    it('should handle array of classes', () => {
      // Arrange & Act
      const result = cn(['class-1', 'class-2'], 'class-3');

      // Assert
      expect(result).toBe('class-1 class-2 class-3');
    });

    it('should handle object syntax', () => {
      // Arrange & Act
      const result = cn('base-class', { 'conditional-class': true, 'not-applied': false });

      // Assert
      expect(result).toBe('base-class conditional-class');
    });

    it('should merge conflicting tailwind classes properly', () => {
      // Arrange & Act
      const result = cn('text-red-500', 'text-blue-500', 'text-lg', 'text-sm');

      // Assert - last conflicting class wins
      expect(result).toBe('text-blue-500 text-sm');
    });
  });

  describe('getGradientFromString', () => {
    it('should return a consistent gradient for the same string', () => {
      // Arrange
      const str = 'testuser@example.com';

      // Act
      const result1 = getGradientFromString(str);
      const result2 = getGradientFromString(str);

      // Assert
      expect(result1).toBe(result2);
    });

    it('should return different gradients for different strings', () => {
      // Arrange
      const str1 = 'user1@example.com';
      const str2 = 'user2@example.com';

      // Act
      const result1 = getGradientFromString(str1);
      const result2 = getGradientFromString(str2);

      // Assert
      expect(result1).not.toBe(result2);
    });

    it('should return a valid gradient string format', () => {
      // Arrange
      const str = 'test@example.com';

      // Act
      const result = getGradientFromString(str);

      // Assert
      expect(result).toMatch(/^from-\w+-\d+ to-\w+-\d+$/);
    });

    it('should handle empty string', () => {
      // Arrange & Act
      const result = getGradientFromString('');

      // Assert
      expect(result).toMatch(/^from-\w+-\d+ to-\w+-\d+$/);
    });

    it('should handle very long strings', () => {
      // Arrange
      const str = 'a'.repeat(10000);

      // Act
      const result = getGradientFromString(str);

      // Assert
      expect(result).toMatch(/^from-\w+-\d+ to-\w+-\d+$/);
    });

    it('should handle special characters', () => {
      // Arrange
      const str = '!@#$%^&*()';

      // Act
      const result = getGradientFromString(str);

      // Assert
      expect(result).toMatch(/^from-\w+-\d+ to-\w+-\d+$/);
    });
  });

  describe('getInitials', () => {
    it('should return initials from full name', () => {
      // Arrange
      const name = 'John Doe';

      // Act
      const result = getInitials(name);

      // Assert
      expect(result).toBe('JD');
    });

    it('should return single initial for single name', () => {
      // Arrange
      const name = 'John';

      // Act
      const result = getInitials(name);

      // Assert
      expect(result).toBe('J');
    });

    it('should handle names with more than two words', () => {
      // Arrange
      const name = 'John Jacob Jingleheimer Schmidt';

      // Act
      const result = getInitials(name);

      // Assert - should only take first two initials
      expect(result).toBe('JJ');
    });

    it('should return uppercase initials', () => {
      // Arrange
      const name = 'john doe';

      // Act
      const result = getInitials(name);

      // Assert
      expect(result).toBe('JD');
    });

    it('should handle names with mixed case', () => {
      // Arrange
      const name = 'JoHn DoE';

      // Act
      const result = getInitials(name);

      // Assert
      expect(result).toBe('JD');
    });

    it('should handle names with extra spaces', () => {
      // Arrange
      const name = '  John   Doe  ';

      // Act
      const result = getInitials(name);

      // Assert - split by space will create empty strings but map will still work
      expect(result).toBe('JD');
    });

    it('should handle empty string', () => {
      // Arrange
      const name = '';

      // Act
      const result = getInitials(name);

      // Assert
      expect(result).toBe('');
    });
  });

  describe('getFormattedDate', () => {
    it('should format date string to Spanish long format', () => {
      // Arrange
      const dateString = '2024-03-15';

      // Act
      const result = getFormattedDate(dateString);

      // Assert
      expect(result).toContain('2024');
      expect(result.toLowerCase()).toMatch(/marzo/);
    });

    it('should handle ISO date strings', () => {
      // Arrange
      const dateString = '2024-12-25T00:00:00.000Z';

      // Act
      const result = getFormattedDate(dateString);

      // Assert
      expect(result).toContain('2024');
    });

    it('should handle different date formats', () => {
      // Arrange
      const dateString = '2024-06-15';

      // Act
      const result = getFormattedDate(dateString);

      // Assert
      expect(result).toContain('2024');
      expect(result.toLowerCase()).toMatch(/junio/);
    });

    it('should throw error for invalid date', () => {
      // Arrange
      const invalidDate = 'invalid-date';

      // Act & Assert
      expect(() => getFormattedDate(invalidDate)).toThrow();
    });
  });
});
