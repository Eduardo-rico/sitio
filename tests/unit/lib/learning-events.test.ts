import { describe, it, expect, vi } from 'vitest';
import {
  LEARNING_EVENT_TYPES,
  LearningEventType,
  LearningEventInput,
  trackLearningEvent,
} from '@/lib/learning-events';
import prisma from '@/lib/prisma';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    learningEvent: {
      create: vi.fn(),
    },
  },
}));

describe('learning-events', () => {
  describe('LEARNING_EVENT_TYPES', () => {
    it('should contain all expected event types', () => {
      const expectedTypes = [
        'course_enrolled',
        'lesson_viewed',
        'lesson_active_time',
        'exercise_code_run',
        'exercise_validated',
        'exercise_feedback_submitted',
        'hint_opened',
        'solution_opened',
      ];

      expect(LEARNING_EVENT_TYPES).toEqual(expectedTypes);
    });

    it('should have correct type for LearningEventType', () => {
      const validType: LearningEventType = 'course_enrolled';
      expect(validType).toBe('course_enrolled');
    });
  });

  describe('trackLearningEvent', () => {
    it('should call prisma.learningEvent.create with correct data', async () => {
      // Arrange
      const input: LearningEventInput = {
        eventType: 'lesson_viewed',
        userId: 'user-123',
        userEmail: 'user@example.com',
        courseId: 'course-123',
        courseSlug: 'intro-course',
        lessonId: 'lesson-456',
        lessonSlug: 'lesson-one',
        exerciseId: 'exercise-789',
        exerciseTitle: 'Exercise One',
        source: 'web',
        metadata: { duration: 120 },
      };
      vi.mocked(prisma.learningEvent.create).mockResolvedValue({} as never);

      // Act
      await trackLearningEvent(input);

      // Assert
      expect(prisma.learningEvent.create).toHaveBeenCalledWith({
        data: {
          eventType: 'lesson_viewed',
          userId: 'user-123',
          userEmail: 'user@example.com',
          courseId: 'course-123',
          courseSlug: 'intro-course',
          lessonId: 'lesson-456',
          lessonSlug: 'lesson-one',
          exerciseId: 'exercise-789',
          exerciseTitle: 'Exercise One',
          source: 'web',
          metadata: { duration: 120 },
        },
      });
    });

    it('should handle optional values with defaults', async () => {
      // Arrange
      const input: LearningEventInput = {
        eventType: 'course_enrolled',
      };
      vi.mocked(prisma.learningEvent.create).mockResolvedValue({} as never);

      // Act
      await trackLearningEvent(input);

      // Assert
      expect(prisma.learningEvent.create).toHaveBeenCalledWith({
        data: {
          eventType: 'course_enrolled',
          userId: null,
          userEmail: null,
          courseId: null,
          courseSlug: null,
          lessonId: null,
          lessonSlug: null,
          exerciseId: null,
          exerciseTitle: null,
          source: 'web',
          metadata: {},
        },
      });
    });

    it('should handle null values for optional fields', async () => {
      // Arrange
      const input: LearningEventInput = {
        eventType: 'hint_opened',
        userId: null,
        userEmail: null,
        courseId: null,
        courseSlug: null,
        lessonId: null,
        lessonSlug: null,
        exerciseId: null,
        exerciseTitle: null,
      };
      vi.mocked(prisma.learningEvent.create).mockResolvedValue({} as never);

      // Act
      await trackLearningEvent(input);

      // Assert
      expect(prisma.learningEvent.create).toHaveBeenCalledWith({
        data: {
          eventType: 'hint_opened',
          userId: null,
          userEmail: null,
          courseId: null,
          courseSlug: null,
          lessonId: null,
          lessonSlug: null,
          exerciseId: null,
          exerciseTitle: null,
          source: 'web',
          metadata: {},
        },
      });
    });

    it('should handle partial optional values', async () => {
      // Arrange
      const input: LearningEventInput = {
        eventType: 'exercise_code_run',
        userId: 'user-456',
        courseSlug: 'advanced-course',
        metadata: { code: 'console.log("hello")' },
      };
      vi.mocked(prisma.learningEvent.create).mockResolvedValue({} as never);

      // Act
      await trackLearningEvent(input);

      // Assert
      expect(prisma.learningEvent.create).toHaveBeenCalledWith({
        data: {
          eventType: 'exercise_code_run',
          userId: 'user-456',
          userEmail: null,
          courseId: null,
          courseSlug: 'advanced-course',
          lessonId: null,
          lessonSlug: null,
          exerciseId: null,
          exerciseTitle: null,
          source: 'web',
          metadata: { code: 'console.log("hello")' },
        },
      });
    });

    it('should handle errors without throwing', async () => {
      // Arrange
      const input: LearningEventInput = {
        eventType: 'solution_opened',
      };
      const error = new Error('Database connection failed');
      vi.mocked(prisma.learningEvent.create).mockRejectedValue(error as never);
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Act - should not throw
      await trackLearningEvent(input);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error tracking learning event:', error);

      // Cleanup
      consoleErrorSpy.mockRestore();
    });

    it('should use default source "web" when not provided', async () => {
      // Arrange
      const input: LearningEventInput = {
        eventType: 'exercise_validated',
        userId: 'user-789',
      };
      vi.mocked(prisma.learningEvent.create).mockResolvedValue({} as never);

      // Act
      await trackLearningEvent(input);

      // Assert
      expect(prisma.learningEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            source: 'web',
          }),
        })
      );
    });

    it('should use custom source when provided', async () => {
      // Arrange
      const input: LearningEventInput = {
        eventType: 'exercise_feedback_submitted',
        source: 'mobile_app',
      };
      vi.mocked(prisma.learningEvent.create).mockResolvedValue({} as never);

      // Act
      await trackLearningEvent(input);

      // Assert
      expect(prisma.learningEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            source: 'mobile_app',
          }),
        })
      );
    });

    it('should work with all event types', async () => {
      // Arrange
      vi.mocked(prisma.learningEvent.create).mockResolvedValue({} as never);

      // Act & Assert
      for (const eventType of LEARNING_EVENT_TYPES) {
        await trackLearningEvent({ eventType });
        expect(prisma.learningEvent.create).toHaveBeenLastCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ eventType }),
          })
        );
      }
    });
  });
});
