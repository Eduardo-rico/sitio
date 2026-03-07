import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock PrismaClient
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  })),
}));

describe('prisma', () => {
  beforeEach(() => {
    // Reset modules to ensure fresh imports
    vi.resetModules();
    // Clear globalThis.prisma
    delete (globalThis as unknown as { prisma?: unknown }).prisma;
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('export behavior', () => {
    it('should export a PrismaClient instance', async () => {
      // Arrange
      const { PrismaClient } = await import('@prisma/client');

      // Act
      const { prisma } = await import('@/lib/prisma');

      // Assert
      expect(PrismaClient).toHaveBeenCalledTimes(1);
      expect(prisma).toBeDefined();
    });

    it('should reuse existing instance from globalThis if available', async () => {
      // Arrange
      const existingPrisma = { $connect: vi.fn(), $disconnect: vi.fn() };
      (globalThis as unknown as { prisma: unknown }).prisma = existingPrisma;

      // Act
      const { prisma } = await import('@/lib/prisma');

      // Assert
      const { PrismaClient } = await import('@prisma/client');
      expect(PrismaClient).not.toHaveBeenCalled();
      expect(prisma).toBe(existingPrisma);
    });

    it('should export prisma as default', async () => {
      // Act
      const prismaModule = await import('@/lib/prisma');

      // Assert
      expect(prismaModule.default).toBe(prismaModule.prisma);
    });
  });

  describe('environment handling', () => {
    it('should store instance in globalThis.prisma in development', async () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Act
      await import('@/lib/prisma');

      // Assert
      expect((globalThis as unknown as { prisma?: unknown }).prisma).toBeDefined();

      // Cleanup
      process.env.NODE_ENV = originalEnv;
    });

    it('should store instance in globalThis.prisma in test environment', async () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';

      // Act
      await import('@/lib/prisma');

      // Assert
      expect((globalThis as unknown as { prisma?: unknown }).prisma).toBeDefined();

      // Cleanup
      process.env.NODE_ENV = originalEnv;
    });

    it('should not modify globalThis.prisma in production', async () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Act
      await import('@/lib/prisma');

      // Assert
      expect((globalThis as unknown as { prisma?: unknown }).prisma).toBeUndefined();

      // Cleanup
      process.env.NODE_ENV = originalEnv;
    });
  });
});
