import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce, useDebouncedCallback } from '@/hooks/use-debounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    // Arrange
    const initialValue = 'initial';

    // Act
    const { result } = renderHook(() => useDebounce(initialValue, 500));

    // Assert
    expect(result.current).toBe(initialValue);
  });

  it('should debounce value updates', () => {
    // Arrange
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    // Act - update value
    rerender({ value: 'updated' });

    // Assert - value should not change immediately
    expect(result.current).toBe('initial');

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Assert - value should now be updated
    expect(result.current).toBe('updated');
  });

  it('should reset timer on rapid updates', () => {
    // Arrange
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    // Act - multiple rapid updates
    rerender({ value: 'update1' });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    rerender({ value: 'update2' });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Assert - value should still be initial (timer was reset)
    expect(result.current).toBe('initial');

    // Fast-forward full delay after last update
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Assert - value should be the last update
    expect(result.current).toBe('update2');
  });

  it('should use default delay of 500ms', () => {
    // Arrange
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    );

    // Act
    rerender({ value: 'updated' });
    act(() => {
      vi.advanceTimersByTime(499);
    });

    // Assert
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe('updated');
  });

  it('should handle custom delay', () => {
    // Arrange
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 1000),
      { initialProps: { value: 'initial' } }
    );

    // Act
    rerender({ value: 'updated' });
    act(() => {
      vi.advanceTimersByTime(999);
    });

    // Assert
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe('updated');
  });

  it('should handle numeric values', () => {
    // Arrange
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 0 } }
    );

    // Act
    rerender({ value: 100 });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Assert
    expect(result.current).toBe(100);
  });

  it('should handle object values', () => {
    // Arrange
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: { count: 0 } } }
    );

    // Act
    const newValue = { count: 5 };
    rerender({ value: newValue });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Assert
    expect(result.current).toEqual({ count: 5 });
  });

  it('should cleanup timer on unmount', () => {
    // Arrange
    const { rerender, unmount } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    // Act
    unmount();

    // Assert - should not throw when timer fires after unmount
    expect(() => {
      act(() => {
        vi.advanceTimersByTime(500);
      });
    }).not.toThrow();
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should debounce callback execution', () => {
    // Arrange
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    // Act
    act(() => {
      result.current('arg1');
    });

    // Assert - callback should not be called immediately
    expect(callback).not.toHaveBeenCalled();

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Assert - callback should now be called
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('arg1');
  });

  it('should reset timer on rapid calls', () => {
    // Arrange
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    // Act - multiple rapid calls
    act(() => {
      result.current('first');
      vi.advanceTimersByTime(300);
      result.current('second');
      vi.advanceTimersByTime(300);
      result.current('third');
    });

    // Assert - callback should not have been called yet
    expect(callback).not.toHaveBeenCalled();

    // Fast-forward full delay after last call
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Assert - only the last call should be executed
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('third');
  });

  it('should pass multiple arguments to callback', () => {
    // Arrange
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    // Act
    act(() => {
      result.current('arg1', 42, { key: 'value' });
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Assert
    expect(callback).toHaveBeenCalledWith('arg1', 42, { key: 'value' });
  });

  it('should handle callback that returns a value', () => {
    // Arrange
    const callback = vi.fn().mockReturnValue('result');
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    // Act
    act(() => {
      result.current();
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Assert - callback was called (return value is not accessible due to debounce)
    expect(callback).toHaveBeenCalled();
  });

  it('should use default delay of 500ms', () => {
    // Arrange
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback));

    // Act
    act(() => {
      result.current();
    });

    act(() => {
      vi.advanceTimersByTime(499);
    });

    // Assert
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(callback).toHaveBeenCalled();
  });
});
