import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBottomSheet } from '@/hooks/use-bottom-sheet';

describe('useBottomSheet', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Reset body overflow before each test
    document.body.style.overflow = '';
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    // Cleanup body overflow after each test
    document.body.style.overflow = '';
  });

  describe('initial state', () => {
    it('should have correct default initial state', () => {
      // Act
      const { result } = renderHook(() => useBottomSheet());

      // Assert
      expect(result.current.isOpen).toBe(false);
      expect(result.current.snapIndex).toBe(0);
      expect(result.current.isDragging).toBe(false);
      expect(result.current.snapPoints).toEqual([25, 50, 85]);
      expect(result.current.currentSnapPoint).toBe(25);
      expect(result.current.sheetRef.current).toBeNull();
    });

    it('should initialize with defaultOpen set to true', () => {
      // Act
      const { result } = renderHook(() => useBottomSheet({ defaultOpen: true }));

      // Assert
      expect(result.current.isOpen).toBe(true);
      expect(result.current.snapIndex).toBe(0);
    });

    it('should use custom snapPoints', () => {
      // Act
      const { result } = renderHook(() => useBottomSheet({
        snapPoints: [10, 30, 60, 90],
      }));

      // Assert
      expect(result.current.snapPoints).toEqual([10, 30, 60, 90]);
      expect(result.current.currentSnapPoint).toBe(10);
    });

    it('should use custom initialSnap index', () => {
      // Act
      const { result } = renderHook(() => useBottomSheet({
        initialSnap: 1,
      }));

      // Assert
      expect(result.current.snapIndex).toBe(1);
      expect(result.current.currentSnapPoint).toBe(50);
    });
  });

  describe('open', () => {
    it('should open the sheet and set snapIndex to initialSnap', () => {
      // Arrange
      const onOpen = vi.fn();
      const { result } = renderHook(() => useBottomSheet({
        initialSnap: 2,
        onOpen,
      }));

      // Act
      act(() => {
        result.current.open();
      });

      // Assert
      expect(result.current.isOpen).toBe(true);
      expect(result.current.snapIndex).toBe(2);
      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it('should reset snapIndex to initialSnap when reopening', () => {
      // Arrange
      const { result } = renderHook(() => useBottomSheet({
        initialSnap: 0,
      }));

      // Act - open and snap to a different point
      act(() => {
        result.current.open();
      });
      act(() => {
        result.current.snapTo(2);
      });

      // Assert - should be at snap 2
      expect(result.current.snapIndex).toBe(2);

      // Act - close and reopen
      act(() => {
        result.current.close();
      });
      act(() => {
        result.current.open();
      });

      // Assert - should reset to initialSnap
      expect(result.current.snapIndex).toBe(0);
    });

    it('should work without onOpen callback', () => {
      // Arrange
      const { result } = renderHook(() => useBottomSheet());

      // Act & Assert - should not throw
      expect(() => {
        act(() => {
          result.current.open();
        });
      }).not.toThrow();

      expect(result.current.isOpen).toBe(true);
    });
  });

  describe('close', () => {
    it('should close the sheet', () => {
      // Arrange
      const onClose = vi.fn();
      const { result } = renderHook(() => useBottomSheet({
        defaultOpen: true,
        onClose,
      }));

      // Act
      act(() => {
        result.current.close();
      });

      // Assert
      expect(result.current.isOpen).toBe(false);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should work without onClose callback', () => {
      // Arrange
      const { result } = renderHook(() => useBottomSheet({ defaultOpen: true }));

      // Act & Assert - should not throw
      expect(() => {
        act(() => {
          result.current.close();
        });
      }).not.toThrow();

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('snapTo', () => {
    it('should update snapIndex to valid index', () => {
      // Arrange
      const { result } = renderHook(() => useBottomSheet());

      // Act
      act(() => {
        result.current.snapTo(1);
      });

      // Assert
      expect(result.current.snapIndex).toBe(1);
      expect(result.current.currentSnapPoint).toBe(50);
    });

    it('should update to last valid index', () => {
      // Arrange
      const { result } = renderHook(() => useBottomSheet());

      // Act
      act(() => {
        result.current.snapTo(2);
      });

      // Assert
      expect(result.current.snapIndex).toBe(2);
      expect(result.current.currentSnapPoint).toBe(85);
    });

    it('should not update snapIndex for negative index', () => {
      // Arrange
      const { result } = renderHook(() => useBottomSheet());

      // Act
      act(() => {
        result.current.snapTo(-1);
      });

      // Assert
      expect(result.current.snapIndex).toBe(0);
    });

    it('should not update snapIndex for index out of bounds', () => {
      // Arrange
      const { result } = renderHook(() => useBottomSheet());

      // Act
      act(() => {
        result.current.snapTo(10);
      });

      // Assert
      expect(result.current.snapIndex).toBe(0);
    });

    it('should handle index at boundary (exact length)', () => {
      // Arrange
      const { result } = renderHook(() => useBottomSheet({
        snapPoints: [25, 50, 85],
      }));

      // Act - index equal to length should not work
      act(() => {
        result.current.snapTo(3);
      });

      // Assert
      expect(result.current.snapIndex).toBe(0);
    });
  });

  describe('expand', () => {
    it('should expand to the last snap point', () => {
      // Arrange
      const { result } = renderHook(() => useBottomSheet());

      // Act
      act(() => {
        result.current.expand();
      });

      // Assert
      expect(result.current.snapIndex).toBe(2);
      expect(result.current.currentSnapPoint).toBe(85);
    });

    it('should expand with custom snapPoints', () => {
      // Arrange
      const { result } = renderHook(() => useBottomSheet({
        snapPoints: [10, 30, 50, 70, 90],
      }));

      // Act
      act(() => {
        result.current.expand();
      });

      // Assert
      expect(result.current.snapIndex).toBe(4);
      expect(result.current.currentSnapPoint).toBe(90);
    });
  });

  describe('collapse', () => {
    it('should collapse to the first snap point', () => {
      // Arrange
      const { result } = renderHook(() => useBottomSheet({
        initialSnap: 2,
      }));

      // Act
      act(() => {
        result.current.collapse();
      });

      // Assert
      expect(result.current.snapIndex).toBe(0);
      expect(result.current.currentSnapPoint).toBe(25);
    });

    it('should stay at first snap point if already there', () => {
      // Arrange
      const { result } = renderHook(() => useBottomSheet({
        initialSnap: 0,
      }));

      // Act
      act(() => {
        result.current.collapse();
      });

      // Assert
      expect(result.current.snapIndex).toBe(0);
    });
  });

  describe('handleBackdropClick', () => {
    it('should close sheet when clicking backdrop (target === currentTarget)', () => {
      // Arrange
      const onClose = vi.fn();
      const { result } = renderHook(() => useBottomSheet({
        defaultOpen: true,
        onClose,
      }));

      // Create a mock event where target === currentTarget
      const backdropElement = document.createElement('div');
      const mockEvent = {
        target: backdropElement,
        currentTarget: backdropElement,
      } as unknown as React.MouseEvent;

      // Act
      act(() => {
        result.current.handleBackdropClick(mockEvent);
      });

      // Assert
      expect(result.current.isOpen).toBe(false);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not close sheet when clicking inside content (target !== currentTarget)', () => {
      // Arrange
      const onClose = vi.fn();
      const { result } = renderHook(() => useBottomSheet({
        defaultOpen: true,
        onClose,
      }));

      // Create a mock event where target !== currentTarget
      const contentElement = document.createElement('div');
      const backdropElement = document.createElement('div');
      const mockEvent = {
        target: contentElement,
        currentTarget: backdropElement,
      } as unknown as React.MouseEvent;

      // Act
      act(() => {
        result.current.handleBackdropClick(mockEvent);
      });

      // Assert
      expect(result.current.isOpen).toBe(true);
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('dragging handlers', () => {
    it('should set isDragging to true on handleTouchStart', () => {
      // Arrange
      const { result } = renderHook(() => useBottomSheet());

      const mockTouchEvent = {
        touches: [{ clientY: 100 }],
      } as unknown as React.TouchEvent;

      // Act
      act(() => {
        result.current.handleTouchStart(mockTouchEvent);
      });

      // Assert
      expect(result.current.isDragging).toBe(true);
    });

    it('should set isDragging to true on handleTouchStart with mouse event', () => {
      // Arrange
      const { result } = renderHook(() => useBottomSheet());

      const mockMouseEvent = {
        clientY: 100,
      } as unknown as React.MouseEvent;

      // Act
      act(() => {
        result.current.handleTouchStart(mockMouseEvent);
      });

      // Assert
      expect(result.current.isDragging).toBe(true);
    });

    it('should handle handleTouchMove when dragging', () => {
      // Arrange
      const { result } = renderHook(() => useBottomSheet());

      const mockTouchStartEvent = {
        touches: [{ clientY: 100 }],
      } as unknown as React.TouchEvent;

      const mockTouchMoveEvent = {
        touches: [{ clientY: 50 }],
      } as unknown as React.TouchEvent;

      // Act - start dragging
      act(() => {
        result.current.handleTouchStart(mockTouchStartEvent);
      });

      // Act - move
      act(() => {
        result.current.handleTouchMove(mockTouchMoveEvent);
      });

      // Assert - should still be dragging
      expect(result.current.isDragging).toBe(true);
    });

    it('should not process handleTouchMove when not dragging', () => {
      // Arrange
      const { result } = renderHook(() => useBottomSheet());

      const mockTouchMoveEvent = {
        touches: [{ clientY: 50 }],
      } as unknown as React.TouchEvent;

      // Act - move without starting drag
      act(() => {
        result.current.handleTouchMove(mockTouchMoveEvent);
      });

      // Assert - should not be dragging
      expect(result.current.isDragging).toBe(false);
    });

    it('should handle drag sequence and reset isDragging', () => {
      // Arrange - need to mock the sheetRef with a DOM element
      const { result } = renderHook(() => useBottomSheet({
        defaultOpen: true,
        initialSnap: 1,
      }));

      // Set up the sheetRef with a mock element
      const mockDiv = document.createElement('div');
      Object.defineProperty(mockDiv, 'getBoundingClientRect', {
        value: () => ({ height: 400 }),
        writable: true,
      });
      
      act(() => {
        // @ts-expect-error - setting ref manually for testing
        result.current.sheetRef.current = mockDiv;
      });

      const mockTouchStartEvent = {
        touches: [{ clientY: 500 }],
      } as unknown as React.TouchEvent;

      const mockTouchMoveEvent = {
        touches: [{ clientY: 200 }],
      } as unknown as React.TouchEvent;

      // Act - start dragging
      act(() => {
        result.current.handleTouchStart(mockTouchStartEvent);
      });
      expect(result.current.isDragging).toBe(true);

      // Act - move and end in a separate act to allow state updates
      act(() => {
        result.current.handleTouchMove(mockTouchMoveEvent);
        result.current.handleTouchEnd();
      });

      // Assert - isDragging should be reset to false after handleTouchEnd
      expect(result.current.isDragging).toBe(false);
    });

    it('should handle touch end with mouse event', () => {
      // Arrange
      const { result } = renderHook(() => useBottomSheet());

      const mockMouseEvent = {
        clientY: 100,
      } as unknown as React.MouseEvent;

      // Act - start dragging with mouse
      act(() => {
        result.current.handleTouchStart(mockMouseEvent);
      });

      expect(result.current.isDragging).toBe(true);

      // Act - end dragging
      act(() => {
        result.current.handleTouchEnd();
      });

      // Assert
      expect(result.current.isDragging).toBe(false);
    });

    it('should handle handleTouchMove with mouse event', () => {
      // Arrange
      const { result } = renderHook(() => useBottomSheet());

      const mockMouseStartEvent = {
        clientY: 100,
      } as unknown as React.MouseEvent;

      const mockMouseMoveEvent = {
        clientY: 200,
      } as unknown as React.MouseEvent;

      // Act
      act(() => {
        result.current.handleTouchStart(mockMouseStartEvent);
      });
      act(() => {
        result.current.handleTouchMove(mockMouseMoveEvent);
      });

      // Assert - should still be dragging
      expect(result.current.isDragging).toBe(true);
    });

    it('should not change snap on small drag (below threshold)', () => {
      // Arrange
      const { result } = renderHook(() => useBottomSheet({
        defaultOpen: true,
        initialSnap: 1,
      }));

      const mockTouchStartEvent = {
        touches: [{ clientY: 200 }],
      } as unknown as React.TouchEvent;

      const mockTouchMoveEvent = {
        touches: [{ clientY: 230 }], // Drag down by only 30 (below 50 threshold)
      } as unknown as React.TouchEvent;

      // Act - start and small drag
      act(() => {
        result.current.handleTouchStart(mockTouchStartEvent);
      });
      act(() => {
        result.current.handleTouchMove(mockTouchMoveEvent);
      });
      act(() => {
        result.current.handleTouchEnd();
      });

      // Assert - should stay at same snap point
      expect(result.current.snapIndex).toBe(1);
      expect(result.current.isDragging).toBe(false);
    });

    it('should not process handleTouchEnd when not dragging', () => {
      // Arrange
      const { result } = renderHook(() => useBottomSheet({
        defaultOpen: true,
        initialSnap: 1,
      }));

      // Act - end without starting drag
      act(() => {
        result.current.handleTouchEnd();
      });

      // Assert - should stay at same snap point
      expect(result.current.snapIndex).toBe(1);
      expect(result.current.isDragging).toBe(false);
    });

    it('should not expand beyond last snap point using expand()', () => {
      // Arrange
      const { result } = renderHook(() => useBottomSheet({
        defaultOpen: true,
        initialSnap: 2, // Already at last snap point
      }));

      // Verify initial state
      expect(result.current.snapIndex).toBe(2);

      // Act - try to expand further using expand()
      act(() => {
        result.current.expand();
      });

      // Assert - should stay at last snap point
      expect(result.current.snapIndex).toBe(2);
    });

    it('should not collapse below first snap point using collapse()', () => {
      // Arrange
      const { result } = renderHook(() => useBottomSheet({
        defaultOpen: true,
        initialSnap: 0, // Already at first snap point
      }));

      // Verify initial state
      expect(result.current.snapIndex).toBe(0);

      // Act - try to collapse further using collapse()
      act(() => {
        result.current.collapse();
      });

      // Assert - should stay at first snap point
      expect(result.current.snapIndex).toBe(0);
    });

    it('should handle complete drag cycle', () => {
      // Arrange
      const { result } = renderHook(() => useBottomSheet());

      // Act - complete cycle: start, move multiple times, end
      act(() => {
        result.current.handleTouchStart({ touches: [{ clientY: 300 }] } as React.TouchEvent);
      });
      expect(result.current.isDragging).toBe(true);

      act(() => {
        result.current.handleTouchMove({ touches: [{ clientY: 250 }] } as React.TouchEvent);
      });
      act(() => {
        result.current.handleTouchMove({ touches: [{ clientY: 200 }] } as React.TouchEvent);
      });
      act(() => {
        result.current.handleTouchEnd();
      });

      // Assert
      expect(result.current.isDragging).toBe(false);
    });
  });

  describe('escape key handler', () => {
    it('should close sheet when Escape key is pressed and sheet is open', () => {
      // Arrange
      const onClose = vi.fn();
      renderHook(() => useBottomSheet({
        defaultOpen: true,
        onClose,
      }));

      // Act - simulate Escape key
      act(() => {
        const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(escapeEvent);
      });

      // Assert
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not close sheet when other keys are pressed', () => {
      // Arrange
      const onClose = vi.fn();
      renderHook(() => useBottomSheet({
        defaultOpen: true,
        onClose,
      }));

      // Act - simulate Enter key
      act(() => {
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        document.dispatchEvent(enterEvent);
      });

      // Assert
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should not close when Escape is pressed but sheet is closed', () => {
      // Arrange
      const onClose = vi.fn();
      renderHook(() => useBottomSheet({
        defaultOpen: false,
        onClose,
      }));

      // Act - simulate Escape key
      act(() => {
        const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(escapeEvent);
      });

      // Assert
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should remove event listener on unmount', () => {
      // Arrange
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      const { unmount } = renderHook(() => useBottomSheet());

      // Act
      unmount();

      // Assert
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      // Cleanup
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('body scroll prevention', () => {
    it('should set body overflow to hidden when sheet opens', () => {
      // Arrange
      const { result } = renderHook(() => useBottomSheet());

      // Act
      act(() => {
        result.current.open();
      });

      // Assert
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body overflow when sheet closes', () => {
      // Arrange
      const { result } = renderHook(() => useBottomSheet({ defaultOpen: true }));

      // Verify initial state
      expect(document.body.style.overflow).toBe('hidden');

      // Act
      act(() => {
        result.current.close();
      });

      // Assert
      expect(document.body.style.overflow).toBe('');
    });

    it('should cleanup body overflow on unmount when open', () => {
      // Arrange
      const { unmount } = renderHook(() => useBottomSheet({ defaultOpen: true }));

      // Verify initial state
      expect(document.body.style.overflow).toBe('hidden');

      // Act
      unmount();

      // Assert
      expect(document.body.style.overflow).toBe('');
    });

    it('should not modify body overflow when unmounting closed sheet', () => {
      // Arrange
      document.body.style.overflow = 'scroll';
      const { unmount } = renderHook(() => useBottomSheet({ defaultOpen: false }));

      // Act
      unmount();

      // Assert - cleanup effect resets overflow to '' (empty string)
      // This is the expected behavior from the useEffect cleanup
      expect(document.body.style.overflow).toBe('');
    });
  });
});
