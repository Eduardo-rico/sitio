import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useToast, useToastState, toast, resetToastState } from '@/hooks/use-toast';

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    resetToastState();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('toast API', () => {
    it('should add a success toast', () => {
      // Act
      const id = toast.success('Operation successful');

      // Assert
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
    });

    it('should add an error toast', () => {
      // Act
      const id = toast.error('Operation failed');

      // Assert
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
    });

    it('should add a warning toast', () => {
      // Act
      const id = toast.warning('Warning message');

      // Assert
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
    });

    it('should add an info toast', () => {
      // Act
      const id = toast.info('Information message');

      // Assert
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
    });

    it('should dismiss a toast by id', () => {
      // Arrange
      const id = toast.success('Test message');

      // Act - should not throw
      expect(() => toast.dismiss(id)).not.toThrow();
    });

    it('should handle promise toast flow', async () => {
      // Arrange
      const mockPromise = Promise.resolve('success');
      const messages = {
        loading: 'Loading...',
        success: 'Success!',
        error: 'Error!',
      };

      // Act
      const promiseResult = toast.promise(mockPromise, messages);

      // Assert
      await expect(promiseResult).resolves.toBe('success');
    });

    it('should handle promise rejection', async () => {
      // Arrange
      const mockPromise = Promise.reject(new Error('Failed'));
      const messages = {
        loading: 'Loading...',
        success: 'Success!',
        error: 'Error!',
      };

      // Act & Assert
      await expect(toast.promise(mockPromise, messages)).rejects.toThrow('Failed');
    });

    it('should allow custom duration', () => {
      // Act
      const id = toast.success('Quick message', { duration: 1000 });

      // Assert
      expect(id).toBeDefined();
    });

    it('should allow custom id', () => {
      // Arrange
      const customId = 'my-custom-id';

      // Act
      const id = toast.success('Message', { id: customId });

      // Assert
      expect(id).toBe(customId);
    });
  });

  describe('useToastState', () => {
    it('should return empty array initially', () => {
      // Act
      const { result } = renderHook(() => useToastState());

      // Assert
      expect(result.current).toEqual([]);
    });

    it('should update when toast is added', async () => {
      // Arrange
      const { result } = renderHook(() => useToastState());

      // Act
      act(() => {
        toast.success('Test message');
      });

      // Assert
      await waitFor(() => {
        expect(result.current).toHaveLength(1);
        expect(result.current[0].message).toBe('Test message');
        expect(result.current[0].variant).toBe('success');
      });
    });

    it('should update when toast is removed', async () => {
      // Arrange
      const { result } = renderHook(() => useToastState());
      let toastId: string;

      act(() => {
        toastId = toast.success('Test message');
      });

      await waitFor(() => {
        expect(result.current).toHaveLength(1);
      });

      // Act
      act(() => {
        toast.dismiss(toastId);
      });

      // Assert
      await waitFor(() => {
        expect(result.current).toHaveLength(0);
      });
    });

    it('should replace toast with same id', async () => {
      // Arrange
      const { result } = renderHook(() => useToastState());
      const customId = 'custom-toast-id';

      // Act
      act(() => {
        toast.info('First message', { id: customId });
      });

      await waitFor(() => {
        expect(result.current).toHaveLength(1);
        expect(result.current[0].message).toBe('First message');
      });

      act(() => {
        toast.success('Second message', { id: customId });
      });

      // Assert
      await waitFor(() => {
        expect(result.current).toHaveLength(1);
        expect(result.current[0].message).toBe('Second message');
        expect(result.current[0].variant).toBe('success');
      });
    });

    it('should handle multiple toasts', async () => {
      // Arrange
      const { result } = renderHook(() => useToastState());

      // Act
      act(() => {
        toast.success('First');
        toast.error('Second');
        toast.info('Third');
      });

      // Assert
      await waitFor(() => {
        expect(result.current).toHaveLength(3);
      });
    });
  });

  describe('useToast hook', () => {
    it('should return toast methods', () => {
      // Act
      const { result } = renderHook(() => useToast());

      // Assert
      expect(result.current.success).toBeDefined();
      expect(result.current.error).toBeDefined();
      expect(result.current.warning).toBeDefined();
      expect(result.current.info).toBeDefined();
      expect(result.current.dismiss).toBeDefined();
      expect(result.current.startTimer).toBeDefined();
    });

    it('should dismiss toast with cleanup', async () => {
      // Arrange
      const { result } = renderHook(() => useToast());
      const { result: stateResult } = renderHook(() => useToastState());

      let toastId: string;
      act(() => {
        toastId = toast.success('Test message');
      });

      await waitFor(() => {
        expect(stateResult.current).toHaveLength(1);
      });

      // Act
      act(() => {
        result.current.dismiss(toastId);
      });

      // Assert
      await waitFor(() => {
        expect(stateResult.current).toHaveLength(0);
      });
    });

    it('should start timer for auto-dismiss', async () => {
      // Arrange
      const { result } = renderHook(() => useToast());
      const { result: stateResult } = renderHook(() => useToastState());

      act(() => {
        toast.success('Test message', { duration: 1000 });
      });

      await waitFor(() => {
        expect(stateResult.current).toHaveLength(1);
      });

      const toastId = stateResult.current[0].id;

      // Act
      act(() => {
        result.current.startTimer(toastId, 100);
      });

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(150);
      });

      // Assert
      await waitFor(() => {
        expect(stateResult.current).toHaveLength(0);
      });
    });

    it('should clear existing timer when starting new one', async () => {
      // Arrange
      const { result } = renderHook(() => useToast());
      const { result: stateResult } = renderHook(() => useToastState());

      act(() => {
        toast.success('Test message');
      });

      await waitFor(() => {
        expect(stateResult.current).toHaveLength(1);
      });

      const toastId = stateResult.current[0].id;

      // Act - start two timers in succession
      act(() => {
        result.current.startTimer(toastId, 5000);
        result.current.startTimer(toastId, 100);
      });

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(150);
      });

      // Assert - should be dismissed after second timer
      await waitFor(() => {
        expect(stateResult.current).toHaveLength(0);
      });
    });
  });
});
