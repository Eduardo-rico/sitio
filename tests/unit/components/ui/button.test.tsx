import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, ArrowRight } from 'lucide-react';

describe('Button', () => {
  describe('rendering', () => {
    it('should render button with children', () => {
      // Arrange & Act
      render(<Button>Click me</Button>);

      // Assert
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('should render as button element by default', () => {
      // Arrange & Act
      render(<Button>Test</Button>);

      // Assert
      expect(screen.getByRole('button')).toHaveProperty('tagName', 'BUTTON');
    });

    it('should render with different variants', () => {
      // Arrange & Act
      const { rerender } = render(<Button variant="primary">Primary</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Button variant="danger">Danger</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render with different sizes', () => {
      // Arrange & Act
      const { rerender } = render(<Button size="sm">Small</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Button size="md">Medium</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onClick when clicked', () => {
      // Arrange
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      // Act
      fireEvent.click(screen.getByRole('button'));

      // Assert
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      // Arrange
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Click me</Button>);

      // Act
      fireEvent.click(screen.getByRole('button'));

      // Assert
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should have disabled attribute when disabled', () => {
      // Arrange & Act
      render(<Button disabled>Disabled</Button>);

      // Assert
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should have aria-disabled when disabled', () => {
      // Arrange & Act
      render(<Button disabled>Disabled</Button>);

      // Assert
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('loading state', () => {
    it('should show loading spinner when loading', () => {
      // Arrange & Act
      render(<Button loading>Loading</Button>);

      // Assert
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });

    it('should be disabled when loading', () => {
      // Arrange & Act
      render(<Button loading>Loading</Button>);

      // Assert
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should not call onClick when loading', () => {
      // Arrange
      const handleClick = vi.fn();
      render(<Button loading onClick={handleClick}>Loading</Button>);

      // Act
      fireEvent.click(screen.getByRole('button'));

      // Assert
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('icons', () => {
    it('should render with left icon', () => {
      // Arrange & Act
      render(<Button leftIcon={<Plus data-testid="left-icon" />}>With Left Icon</Button>);

      // Assert
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('should render with right icon', () => {
      // Arrange & Act
      render(<Button rightIcon={<ArrowRight data-testid="right-icon" />}>With Right Icon</Button>);

      // Assert
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('should not show left icon when loading', () => {
      // Arrange & Act
      render(
        <Button loading leftIcon={<Plus data-testid="left-icon" />}>
          Loading
        </Button>
      );

      // Assert
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
    });

    it('should not show right icon when loading', () => {
      // Arrange & Act
      render(
        <Button loading rightIcon={<ArrowRight data-testid="right-icon" />}>
          Loading
        </Button>
      );

      // Assert
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should be focusable', () => {
      // Arrange & Act
      render(<Button>Focusable</Button>);
      const button = screen.getByRole('button');
      button.focus();

      // Assert
      expect(button).toHaveFocus();
    });

    it('should have button role', () => {
      // Arrange & Act
      render(<Button>Button</Button>);

      // Assert
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should support custom className', () => {
      // Arrange & Act
      render(<Button className="custom-class">Custom</Button>);

      // Assert
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });
  });

  describe('asChild prop', () => {
    it('should render with asChild prop without error', () => {
      // Arrange & Act - just verify it doesn't throw
      // Note: Radix Slot requires exactly one child element
      const { container } = render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );

      // Assert
      expect(container.querySelector('a')).toBeInTheDocument();
    });
  });
});
