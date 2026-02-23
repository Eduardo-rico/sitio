import { vi } from 'vitest';

// Create mock Prisma client
export const mockPrismaClient = {
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  course: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  lesson: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  exercise: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  progress: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    upsert: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  codeSubmission: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  subscription: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  $connect: vi.fn(),
  $disconnect: vi.fn(),
  $transaction: vi.fn((callback) => callback(mockPrismaClient)),
};

// Mock the prisma module
vi.mock('@/lib/prisma', () => ({
  default: mockPrismaClient,
  prisma: mockPrismaClient,
}));

vi.mock('./prisma', () => ({
  default: mockPrismaClient,
  prisma: mockPrismaClient,
}));

export const resetPrismaMocks = () => {
  Object.values(mockPrismaClient).forEach((model) => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach((method) => {
        if (typeof method === 'function' && 'mockClear' in method) {
          (method as ReturnType<typeof vi.fn>).mockClear();
        }
      });
    }
  });
};
