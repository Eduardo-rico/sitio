import { vi } from 'vitest';

export const mockSession = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    image: 'https://example.com/avatar.jpg',
    role: 'user',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export const mockAdminSession = {
  user: {
    id: 'admin-123',
    email: 'admin@example.com',
    name: 'Admin User',
    image: null,
    role: 'admin',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export const mockUnauthenticatedSession = null;

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({
    data: mockSession,
    status: 'authenticated',
    update: vi.fn(),
  })),
  signIn: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(() => Promise.resolve(mockSession)),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock next-auth
vi.mock('next-auth', () => ({
  default: vi.fn(() => ({
    auth: vi.fn(() => Promise.resolve(mockSession)),
    handlers: {
      GET: vi.fn(),
      POST: vi.fn(),
    },
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}));

export const resetAuthMocks = () => {
  vi.clearAllMocks();
};
