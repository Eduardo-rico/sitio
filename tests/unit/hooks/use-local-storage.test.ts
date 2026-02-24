import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage, useRemoveLocalStorage } from '@/hooks/use-local-storage';

describe('useLocalStorage', () => {
  let storage: Record<string, string> = {};

  beforeEach(() => {
    storage = {};
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => storage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          storage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete storage[key];
        }),
        clear: vi.fn(() => {
          storage = {};
        }),
      },
      writable: true,
    });
  });

  it('should return initial value when localStorage is empty', () => {
    // Arrange
    const initialValue = { count: 0 };

    // Act
    const { result } = renderHook(() => useLocalStorage('test-key', initialValue));

    // Assert
    expect(result.current[0]).toEqual(initialValue);
  });

  it('should return stored value from localStorage', () => {
    // Arrange
    const storedValue = { count: 5 };
    storage['test-key'] = JSON.stringify(storedValue);

    // Act
    const { result } = renderHook(() => useLocalStorage('test-key', { count: 0 }));

    // Assert
    expect(result.current[0]).toEqual(storedValue);
  });

  it('should update localStorage when value changes', () => {
    // Arrange
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    // Act
    act(() => {
      result.current[1]('updated');
    });

    // Assert
    expect(result.current[0]).toBe('updated');
    expect(window.localStorage.setItem).toHaveBeenCalledWith('test-key', '"updated"');
  });

  it('should support function updates', () => {
    // Arrange
    const { result } = renderHook(() => useLocalStorage('test-key', 0));

    // Act
    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    // Assert
    expect(result.current[0]).toBe(1);
    expect(window.localStorage.setItem).toHaveBeenCalledWith('test-key', '1');
  });

  it('should handle complex objects', () => {
    // Arrange
    const initialValue = { user: { name: 'John', age: 30 }, settings: { theme: 'dark' } };
    const { result } = renderHook(() => useLocalStorage('test-key', initialValue));

    // Act
    const newValue = { user: { name: 'Jane', age: 25 }, settings: { theme: 'light' } };
    act(() => {
      result.current[1](newValue);
    });

    // Assert
    expect(result.current[0]).toEqual(newValue);
    expect(window.localStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(newValue));
  });

  it('should handle arrays', () => {
    // Arrange
    const { result } = renderHook(() => useLocalStorage<string[]>('test-key', []));

    // Act
    act(() => {
      result.current[1](['item1', 'item2']);
    });

    // Assert
    expect(result.current[0]).toEqual(['item1', 'item2']);
  });

  it('should handle boolean values', () => {
    // Arrange
    const { result } = renderHook(() => useLocalStorage('test-key', false));

    // Act
    act(() => {
      result.current[1](true);
    });

    // Assert
    expect(result.current[0]).toBe(true);
    expect(window.localStorage.setItem).toHaveBeenCalledWith('test-key', 'true');
  });

  it('should handle number values', () => {
    // Arrange
    const { result } = renderHook(() => useLocalStorage('test-key', 0));

    // Act
    act(() => {
      result.current[1](42);
    });

    // Assert
    expect(result.current[0]).toBe(42);
    expect(window.localStorage.setItem).toHaveBeenCalledWith('test-key', '42');
  });

  it('should handle null values', () => {
    // Arrange
    const { result } = renderHook(() => useLocalStorage<string | null>('test-key', 'initial'));

    // Act
    act(() => {
      result.current[1](null);
    });

    // Assert
    expect(result.current[0]).toBeNull();
    expect(window.localStorage.setItem).toHaveBeenCalledWith('test-key', 'null');
  });

  it('should handle corrupted localStorage data gracefully', () => {
    // Arrange
    storage['test-key'] = 'not-valid-json';
    const initialValue = { default: true };
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Act
    const { result } = renderHook(() => useLocalStorage('test-key', initialValue));

    // Assert - should fall back to initial value
    expect(result.current[0]).toEqual(initialValue);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error reading localStorage key "test-key":'),
      expect.any(SyntaxError)
    );

    warnSpy.mockRestore();
  });

  it('should update when storage event fires from another tab', () => {
    // Arrange
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    // Act - simulate storage event from another tab
    const newValue = 'from-other-tab';
    storage['test-key'] = JSON.stringify(newValue);
    
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'test-key',
        newValue: JSON.stringify(newValue),
      }));
    });

    // Assert
    expect(result.current[0]).toBe(newValue);
  });

  it('should not update when storage event is for different key', () => {
    // Arrange
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    // Act - simulate storage event for different key
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'other-key',
        newValue: JSON.stringify('other-value'),
      }));
    });

    // Assert
    expect(result.current[0]).toBe('initial');
  });

  it('should use unique keys independently', () => {
    // Arrange
    const { result: result1 } = renderHook(() => useLocalStorage('key1', 'value1'));
    const { result: result2 } = renderHook(() => useLocalStorage('key2', 'value2'));

    // Act
    act(() => {
      result1.current[1]('new-value1');
    });

    // Assert
    expect(result1.current[0]).toBe('new-value1');
    expect(result2.current[0]).toBe('value2');
  });
});

describe('useRemoveLocalStorage', () => {
  let storage: Record<string, string> = {};

  beforeEach(() => {
    storage = {
      'test-key': JSON.stringify('test-value'),
    };

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => storage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          storage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete storage[key];
        }),
        clear: vi.fn(() => {
          storage = {};
        }),
      },
      writable: true,
    });
  });

  it('should remove item from localStorage', () => {
    // Arrange
    const { result } = renderHook(() => useRemoveLocalStorage('test-key'));

    // Act
    act(() => {
      result.current();
    });

    // Assert
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('test-key');
  });

  it('should handle non-existent keys gracefully', () => {
    // Arrange
    const { result } = renderHook(() => useRemoveLocalStorage('non-existent-key'));

    // Act & Assert
    expect(() => {
      act(() => {
        result.current();
      });
    }).not.toThrow();
  });
});
