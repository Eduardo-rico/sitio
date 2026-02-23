import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('Badge', () => {
  describe('rendering', () => {
    it('should render children', () => {
      // Arrange & Act
      render(<Badge>New</Badge>);

      // Assert
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('should render as span element', () => {
      // Arrange & Act
      render(<Badge>Test</Badge>);

      // Assert
      expect(screen.getByText('Test').tagName).toBe('SPAN');
    });
  });

  describe('variants', () => {
    it('should render with default variant', () => {
      // Arrange & Act
      const { container } = render(<Badge>Default</Badge>);

      // Assert
      expect(container.firstChild).toHaveClass('bg-gray-100');
    });

    it('should render with primary variant', () => {
      // Arrange & Act
      const { container } = render(<Badge variant="primary">Primary</Badge>);

      // Assert
      expect(container.firstChild).toHaveClass('bg-blue-100');
    });

    it('should render with secondary variant', () => {
      // Arrange & Act
      const { container } = render(<Badge variant="secondary">Secondary</Badge>);

      // Assert
      expect(container.firstChild).toHaveClass('bg-purple-100');
    });

    it('should render with success variant', () => {
      // Arrange & Act
      const { container } = render(<Badge variant="success">Success</Badge>);

      // Assert
      expect(container.firstChild).toHaveClass('bg-green-100');
    });

    it('should render with warning variant', () => {
      // Arrange & Act
      const { container } = render(<Badge variant="warning">Warning</Badge>);

      // Assert
      expect(container.firstChild).toHaveClass('bg-amber-100');
    });

    it('should render with error variant', () => {
      // Arrange & Act
      const { container } = render(<Badge variant="error">Error</Badge>);

      // Assert
      expect(container.firstChild).toHaveClass('bg-red-100');
    });

    it('should render with info variant', () => {
      // Arrange & Act
      const { container } = render(<Badge variant="info">Info</Badge>);

      // Assert
      expect(container.firstChild).toHaveClass('bg-cyan-100');
    });

    it('should apply correct text color for each variant', () => {
      // Arrange & Act & Assert
      const { container, rerender } = render(<Badge variant="primary">Test</Badge>);
      expect(container.firstChild).toHaveClass('text-blue-800');

      rerender(<Badge variant="success">Test</Badge>);
      expect(container.firstChild).toHaveClass('text-green-800');

      rerender(<Badge variant="error">Test</Badge>);
      expect(container.firstChild).toHaveClass('text-red-800');
    });
  });

  describe('sizes', () => {
    it('should render with medium size by default', () => {
      // Arrange & Act
      const { container } = render(<Badge>Medium</Badge>);

      // Assert
      expect(container.firstChild).toHaveClass('text-sm', 'px-2.5');
    });

    it('should render with small size', () => {
      // Arrange & Act
      const { container } = render(<Badge size="sm">Small</Badge>);

      // Assert
      expect(container.firstChild).toHaveClass('text-xs', 'px-2');
    });

    it('should render with medium size explicitly', () => {
      // Arrange & Act
      const { container } = render(<Badge size="md">Medium</Badge>);

      // Assert
      expect(container.firstChild).toHaveClass('text-sm', 'px-2.5');
    });
  });

  describe('styling', () => {
    it('should be inline-flex', () => {
      // Arrange & Act
      const { container } = render(<Badge>Test</Badge>);

      // Assert
      expect(container.firstChild).toHaveClass('inline-flex');
    });

    it('should have rounded-full shape', () => {
      // Arrange & Act
      const { container } = render(<Badge>Test</Badge>);

      // Assert
      expect(container.firstChild).toHaveClass('rounded-full');
    });

    it('should have font-medium', () => {
      // Arrange & Act
      const { container } = render(<Badge>Test</Badge>);

      // Assert
      expect(container.firstChild).toHaveClass('font-medium');
    });

    it('should be centered', () => {
      // Arrange & Act
      const { container } = render(<Badge>Test</Badge>);

      // Assert
      expect(container.firstChild).toHaveClass('items-center', 'justify-center');
    });
  });

  describe('customization', () => {
    it('should support custom className', () => {
      // Arrange & Act
      const { container } = render(<Badge className="custom-badge">Custom</Badge>);

      // Assert
      expect(container.firstChild).toHaveClass('custom-badge');
    });

    it('should forward ref', () => {
      // Arrange
      const ref = { current: null as HTMLSpanElement | null };
      render(<Badge ref={ref}>Test</Badge>);

      // Assert
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });

    it('should spread additional props', () => {
      // Arrange & Act
      render(<Badge data-testid="custom-badge">Test</Badge>);

      // Assert
      expect(screen.getByTestId('custom-badge')).toBeInTheDocument();
    });
  });

  describe('common use cases', () => {
    it('should work as status badge', () => {
      // Arrange & Act
      render(<Badge variant="success">Active</Badge>);

      // Assert
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should work as category badge', () => {
      // Arrange & Act
      render(<Badge variant="primary">Technology</Badge>);

      // Assert
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });

    it('should work as notification count', () => {
      // Arrange & Act
      render(<Badge variant="error" size="sm">5</Badge>);

      // Assert
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should work with long text', () => {
      // Arrange & Act
      render(<Badge>Very long badge text that might wrap</Badge>);

      // Assert
      expect(screen.getByText('Very long badge text that might wrap')).toBeInTheDocument();
    });
  });
});
