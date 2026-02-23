import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Define validation schemas for testing
const emailSchema = z.string().email('Invalid email address');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  published: z.boolean().optional(),
});

const exerciseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  instructions: z.string().min(10, 'Instructions must be at least 10 characters'),
  initialCode: z.string().optional(),
  validation: z.object({
    type: z.enum(['exact', 'contains', 'regex', 'custom']),
    expected: z.string().optional(),
  }),
});

describe('validations', () => {
  describe('emailSchema', () => {
    it('should validate correct email addresses', () => {
      // Arrange
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.com',
        '123@numeric.com',
      ];

      // Act & Assert
      validEmails.forEach((email) => {
        expect(() => emailSchema.parse(email)).not.toThrow();
      });
    });

    it('should reject invalid email addresses', () => {
      // Arrange
      const invalidEmails = [
        'not-an-email',
        '@nodomain.com',
        'spaces in@email.com',
        'missing@domain',
        '',
      ];

      // Act & Assert
      invalidEmails.forEach((email) => {
        expect(() => emailSchema.parse(email)).toThrow('Invalid email address');
      });
    });
  });

  describe('passwordSchema', () => {
    it('should validate strong passwords', () => {
      // Arrange
      const validPasswords = [
        'Password1',
        'MyStr0ngPass',
        'C0mplex!Pass',
        'UPPERlower123',
      ];

      // Act & Assert
      validPasswords.forEach((password) => {
        expect(() => passwordSchema.parse(password)).not.toThrow();
      });
    });

    it('should reject passwords that are too short', () => {
      // Arrange
      const shortPassword = 'Pass1';

      // Act & Assert
      expect(() => passwordSchema.parse(shortPassword)).toThrow('at least 8 characters');
    });

    it('should reject passwords without uppercase letters', () => {
      // Arrange
      const noUppercase = 'password123';

      // Act & Assert
      expect(() => passwordSchema.parse(noUppercase)).toThrow('uppercase letter');
    });

    it('should reject passwords without lowercase letters', () => {
      // Arrange
      const noLowercase = 'PASSWORD123';

      // Act & Assert
      expect(() => passwordSchema.parse(noLowercase)).toThrow('lowercase letter');
    });

    it('should reject passwords without numbers', () => {
      // Arrange
      const noNumbers = 'PasswordOnly';

      // Act & Assert
      expect(() => passwordSchema.parse(noNumbers)).toThrow('number');
    });
  });

  describe('signUpSchema', () => {
    it('should validate complete sign up data', () => {
      // Arrange
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass1',
        confirmPassword: 'SecurePass1',
      };

      // Act & Assert
      expect(() => signUpSchema.parse(validData)).not.toThrow();
    });

    it('should reject when passwords do not match', () => {
      // Arrange
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass1',
        confirmPassword: 'DifferentPass1',
      };

      // Act & Assert
      expect(() => signUpSchema.parse(invalidData)).toThrow('Passwords do not match');
    });

    it('should reject short names', () => {
      // Arrange
      const invalidData = {
        name: 'J',
        email: 'john@example.com',
        password: 'SecurePass1',
        confirmPassword: 'SecurePass1',
      };

      // Act & Assert
      expect(() => signUpSchema.parse(invalidData)).toThrow('at least 2 characters');
    });

    it('should reject invalid email', () => {
      // Arrange
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'SecurePass1',
        confirmPassword: 'SecurePass1',
      };

      // Act & Assert
      expect(() => signUpSchema.parse(invalidData)).toThrow('Invalid email address');
    });
  });

  describe('signInSchema', () => {
    it('should validate sign in data', () => {
      // Arrange
      const validData = {
        email: 'user@example.com',
        password: 'anypassword',
      };

      // Act & Assert
      expect(() => signInSchema.parse(validData)).not.toThrow();
    });

    it('should reject missing email', () => {
      // Arrange
      const invalidData = {
        email: '',
        password: 'password',
      };

      // Act & Assert
      expect(() => signInSchema.parse(invalidData)).toThrow();
    });

    it('should reject missing password', () => {
      // Arrange
      const invalidData = {
        email: 'user@example.com',
        password: '',
      };

      // Act & Assert
      expect(() => signInSchema.parse(invalidData)).toThrow('Password is required');
    });
  });

  describe('courseSchema', () => {
    it('should validate complete course data', () => {
      // Arrange
      const validData = {
        title: 'Introduction to Python',
        description: 'A comprehensive course covering Python basics and advanced topics.',
        slug: 'intro-to-python',
        level: 'beginner' as const,
        published: true,
      };

      // Act & Assert
      expect(() => courseSchema.parse(validData)).not.toThrow();
    });

    it('should accept valid course levels', () => {
      // Arrange
      const levels = ['beginner', 'intermediate', 'advanced'] as const;

      // Act & Assert
      levels.forEach((level) => {
        const data = {
          title: 'Test Course',
          description: 'This is a test course description that is long enough.',
          slug: 'test-course',
          level,
        };
        expect(() => courseSchema.parse(data)).not.toThrow();
      });
    });

    it('should reject invalid course level', () => {
      // Arrange
      const invalidData = {
        title: 'Test Course',
        description: 'This is a test course description that is long enough.',
        slug: 'test-course',
        level: 'expert',
      };

      // Act & Assert
      expect(() => courseSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid slug format', () => {
      // Arrange
      const invalidSlugs = [
        'Test Course',
        'test_course',
        'testCourse',
        'test course',
        'test@course',
      ];

      // Act & Assert
      invalidSlugs.forEach((slug) => {
        const data = {
          title: 'Test Course',
          description: 'This is a test course description that is long enough.',
          slug,
          level: 'beginner' as const,
        };
        expect(() => courseSchema.parse(data)).toThrow('Slug can only contain');
      });
    });

    it('should reject short description', () => {
      // Arrange
      const invalidData = {
        title: 'Test Course',
        description: 'Short',
        slug: 'test-course',
        level: 'beginner' as const,
      };

      // Act & Assert
      expect(() => courseSchema.parse(invalidData)).toThrow('at least 10 characters');
    });

    it('should reject short title', () => {
      // Arrange
      const invalidData = {
        title: 'AB',
        description: 'This is a test course description that is long enough.',
        slug: 'test-course',
        level: 'beginner' as const,
      };

      // Act & Assert
      expect(() => courseSchema.parse(invalidData)).toThrow('at least 3 characters');
    });
  });

  describe('exerciseSchema', () => {
    it('should validate complete exercise data', () => {
      // Arrange
      const validData = {
        title: 'Hello World Exercise',
        instructions: 'Write a program that prints "Hello World" to the console.',
        initialCode: '# Your code here',
        validation: {
          type: 'exact' as const,
          expected: 'Hello World',
        },
      };

      // Act & Assert
      expect(() => exerciseSchema.parse(validData)).not.toThrow();
    });

    it('should accept all validation types', () => {
      // Arrange
      const types = ['exact', 'contains', 'regex', 'custom'] as const;

      // Act & Assert
      types.forEach((type) => {
        const data = {
          title: 'Test Exercise',
          instructions: 'These are the instructions for the exercise.',
          validation: { type },
        };
        expect(() => exerciseSchema.parse(data)).not.toThrow();
      });
    });

    it('should reject short instructions', () => {
      // Arrange
      const invalidData = {
        title: 'Test Exercise',
        instructions: 'Short',
        validation: {
          type: 'exact' as const,
        },
      };

      // Act & Assert
      expect(() => exerciseSchema.parse(invalidData)).toThrow('at least 10 characters');
    });

    it('should work without optional fields', () => {
      // Arrange
      const minimalData = {
        title: 'Test Exercise',
        instructions: 'These are the instructions for the exercise.',
        validation: {
          type: 'custom' as const,
        },
      };

      // Act & Assert
      expect(() => exerciseSchema.parse(minimalData)).not.toThrow();
    });
  });
});
