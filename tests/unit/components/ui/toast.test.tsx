import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Toast as ToastType, resetToastState, toast, useToastState, useToast } from '@/hooks/use-toast';
import React from 'react';

// Mock framer-motion
vi.mock('framer-motion', () => {
  const createMockComponent = (Tag: any) => {
    const MockMotionComponent = ({ children, layout, variants, initial, animate, exit, transition, ...props }: any) => {
      return <Tag {...props}>{children}</Tag>;
    };
    MockMotionComponent.displayName = `MockMotion(${String(Tag)})`;
    return MockMotionComponent;
  };

  return {
    motion: {
      div: createMockComponent('div'),
      svg: createMockComponent('svg'),
      circle: createMockComponent('circle'),
      path: createMockComponent('path'),
      span: createMockComponent('span'),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Import Toast after mocking framer-motion
import { Toast } from '@/components/ui/toast';

// Simple Toaster component for testing
function TestToaster() {
  const toasts = useToastState();
  const { dismiss } = useToast();

  return (
    <div role="region" aria-live="polite" aria-atomic="true">
      {toasts.map((toast, index) => (
        <Toast key={toast.id} toast={toast} onRemove={dismiss} index={index} />
      ))}
    </div>
  );
}

describe('Toast', () => {
  const mockToast: ToastType = {
    id: 'toast-1',
    message: 'Test message',
    variant: 'success',
    duration: 5000,
    createdAt: Date.now(),
  };

  const mockOnRemove = vi.fn();

  beforeEach(() => {
    resetToastState();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render toast with message', () => {
      // Arrange & Act
      render(<Toast toast={mockToast} onRemove={mockOnRemove} index={0} />);

      // Assert
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('should render success variant', () => {
      // Arrange & Act
      render(<Toast toast={mockToast} onRemove={mockOnRemove} index={0} />);

      // Assert
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('should render error variant', () => {
      // Arrange
      const errorToast: ToastType = { ...mockToast, variant: 'error' };

      // Act
      render(<Toast toast={errorToast} onRemove={mockOnRemove} index={0} />);

      // Assert
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('should render warning variant', () => {
      // Arrange
      const warningToast: ToastType = { ...mockToast, variant: 'warning' };

      // Act
      render(<Toast toast={warningToast} onRemove={mockOnRemove} index={0} />);

      // Assert
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('should render info variant', () => {
      // Arrange
      const infoToast: ToastType = { ...mockToast, variant: 'info' };

      // Act
      render(<Toast toast={infoToast} onRemove={mockOnRemove} index={0} />);

      // Assert
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onRemove when close button is clicked', () => {
      // Arrange
      render(<Toast toast={mockToast} onRemove={mockOnRemove} index={0} />);

      // Act
      const closeButton = screen.getByLabelText('Cerrar notificación');
      fireEvent.click(closeButton);

      // Assert
      expect(mockOnRemove).toHaveBeenCalledWith('toast-1');
    });

    it('should have close button with aria-label', () => {
      // Arrange & Act
      render(<Toast toast={mockToast} onRemove={mockOnRemove} index={0} />);

      // Assert
      expect(screen.getByLabelText('Cerrar notificación')).toBeInTheDocument();
    });
  });

  describe('progress bar', () => {
    it('should show progress bar when duration is finite', () => {
      // Arrange & Act
      const { container } = render(
        <Toast toast={mockToast} onRemove={mockOnRemove} index={0} />
      );

      // Assert
      const progressBar = container.querySelector('[class*="h-1"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should not show progress bar when duration is infinite', () => {
      // Arrange
      const infiniteToast: ToastType = { ...mockToast, duration: Infinity };

      // Act
      const { container } = render(
        <Toast toast={infiniteToast} onRemove={mockOnRemove} index={0} />
      );

      // Assert
      const progressBar = container.querySelector('[class*="h-1"]');
      expect(progressBar).not.toBeInTheDocument();
    });
  });
});

describe('Toaster', () => {
  beforeEach(() => {
    resetToastState();
  });

  afterEach(() => {
    resetToastState();
  });

  it('should render container with correct aria attributes', () => {
    // Arrange & Act
    render(<TestToaster />);

    // Assert
    const container = screen.getByRole('region');
    expect(container).toHaveAttribute('aria-live', 'polite');
    expect(container).toHaveAttribute('aria-atomic', 'true');
  });

  it('should render toasts from global state', async () => {
    // Arrange
    render(<TestToaster />);

    // Act
    act(() => {
      toast.success('Success message', { duration: Infinity });
    });

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });
  });

  it('should render multiple toasts', async () => {
    // Arrange
    render(<TestToaster />);

    // Act
    act(() => {
      toast.success('First message', { duration: Infinity });
      toast.error('Second message', { duration: Infinity });
    });

    // Assert
    await waitFor(() => {
      expect(screen.getByText('First message')).toBeInTheDocument();
      expect(screen.getByText('Second message')).toBeInTheDocument();
    });
  });

  it('should remove toast when dismiss is called', async () => {
    // Arrange
    render(<TestToaster />);
    let toastId: string;

    act(() => {
      toastId = toast.success('Dismiss me', { duration: Infinity });
    });

    await waitFor(() => {
      expect(screen.getByText('Dismiss me')).toBeInTheDocument();
    });

    // Act
    act(() => {
      toast.dismiss(toastId);
    });

    // Assert
    await waitFor(() => {
      expect(screen.queryByText('Dismiss me')).not.toBeInTheDocument();
    });
  });

  it('should handle rapid toast additions', async () => {
    // Arrange
    render(<TestToaster />);

    // Act
    act(() => {
      toast.success('Toast 1', { duration: Infinity });
      toast.success('Toast 2', { duration: Infinity });
      toast.success('Toast 3', { duration: Infinity });
    });

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Toast 1')).toBeInTheDocument();
      expect(screen.getByText('Toast 2')).toBeInTheDocument();
      expect(screen.getByText('Toast 3')).toBeInTheDocument();
    });
  });
});
