import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '@/components/ui/input';
import { Mail, Check, Eye } from 'lucide-react';

describe('Input', () => {
  describe('rendering', () => {
    it('should render input with placeholder', () => {
      // Arrange & Act
      render(<Input placeholder="Enter your email" />);

      // Assert
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    });

    it('should render input element', () => {
      // Arrange & Act
      render(<Input />);

      // Assert
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render with label when provided', () => {
      // Arrange & Act
      render(<Input label="Email Address" />);

      // Assert
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    });

    it('should render helper text when provided', () => {
      // Arrange & Act
      render(<Input helperText="We will never share your email" />);

      // Assert
      expect(screen.getByText('We will never share your email')).toBeInTheDocument();
    });

    it('should render error message when provided', () => {
      // Arrange & Act
      render(<Input error="Email is required" />);

      // Assert
      expect(screen.getByRole('alert')).toHaveTextContent('Email is required');
    });
  });

  describe('value and events', () => {
    it('should display initial value', () => {
      // Arrange & Act
      render(<Input value="test@example.com" onChange={() => {}} />);

      // Assert
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    });

    it('should call onChange when value changes', () => {
      // Arrange
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      // Act
      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'new value' },
      });

      // Assert
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('should update value when typing', () => {
      // Arrange
      render(<Input />);
      const input = screen.getByRole('textbox');

      // Act
      fireEvent.change(input, { target: { value: 'Hello' } });

      // Assert
      expect(input).toHaveValue('Hello');
    });

    it('should call onFocus when focused', () => {
      // Arrange
      const handleFocus = vi.fn();
      render(<Input onFocus={handleFocus} />);

      // Act
      fireEvent.focus(screen.getByRole('textbox'));

      // Assert
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('should call onBlur when blurred', () => {
      // Arrange
      const handleBlur = vi.fn();
      render(<Input onBlur={handleBlur} />);

      // Act
      fireEvent.blur(screen.getByRole('textbox'));

      // Assert
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      // Arrange & Act
      render(<Input disabled />);

      // Assert
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should be disabled when disabled prop is true', () => {
      // Arrange & Act
      render(<Input disabled />);

      // Assert
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should have disabled styling on label when input is disabled', () => {
      // Arrange & Act
      render(<Input label="Test Label" disabled />);

      // Assert
      expect(screen.getByText('Test Label')).toHaveClass('cursor-not-allowed');
    });
  });

  describe('validation state', () => {
    it('should have aria-invalid when error is provided', () => {
      // Arrange & Act
      render(<Input error="This field is required" />);

      // Assert
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have error description id when error is provided', () => {
      // Arrange & Act
      render(<Input id="test-input" error="Error message" />);

      // Assert
      const input = screen.getByRole('textbox');
      const errorId = input.getAttribute('aria-describedby');
      expect(errorId).toContain('test-input-error');
    });

    it('should have helper description id when helperText is provided', () => {
      // Arrange & Act
      render(<Input id="test-input" helperText="Helper text" />);

      // Assert
      const input = screen.getByRole('textbox');
      const helperId = input.getAttribute('aria-describedby');
      expect(helperId).toContain('test-input-helper');
    });

    it('should prioritize error over helperText in aria-describedby', () => {
      // Arrange & Act
      render(
        <Input id="test-input" error="Error message" helperText="Helper text" />
      );

      // Assert
      const input = screen.getByRole('textbox');
      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toContain('test-input-error');
      expect(describedBy).not.toContain('test-input-helper');
    });
  });

  describe('icons', () => {
    it('should render left icon', () => {
      // Arrange & Act
      render(<Input leftIcon={<Mail data-testid="mail-icon" />} />);

      // Assert
      expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
    });

    it('should render right icon', () => {
      // Arrange & Act
      render(<Input rightIcon={<Eye data-testid="eye-icon" />} />);

      // Assert
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
    });

    it('should render both icons', () => {
      // Arrange & Act
      render(
        <Input
          leftIcon={<Mail data-testid="mail-icon" />}
          rightIcon={<Check data-testid="check-icon" />}
        />
      );

      // Assert
      expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should associate label with input via htmlFor', () => {
      // Arrange & Act
      render(<Input id="email-input" label="Email" />);

      // Assert
      const label = screen.getByText('Email');
      expect(label).toHaveAttribute('for', 'email-input');
    });

    it('should auto-generate id when not provided', () => {
      // Arrange & Act
      render(<Input label="Auto ID" />);

      // Assert
      const input = screen.getByLabelText('Auto ID');
      expect(input).toHaveAttribute('id');
      expect(input.id).toBeTruthy();
    });

    it('should use provided id', () => {
      // Arrange & Act
      render(<Input id="custom-id" label="Custom ID" />);

      // Assert
      const input = screen.getByLabelText('Custom ID');
      expect(input).toHaveAttribute('id', 'custom-id');
    });

    it('should support custom className', () => {
      // Arrange & Act
      render(<Input className="custom-class" />);

      // Assert
      expect(screen.getByRole('textbox')).toHaveClass('custom-class');
    });

    it('should support fullWidth on container', () => {
      // Arrange & Act
      const { container } = render(<Input fullWidth />);

      // Assert
      expect(container.firstChild).toHaveClass('w-full');
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref to input element', () => {
      // Arrange
      const ref = { current: null as HTMLInputElement | null };
      render(<Input ref={ref} />);

      // Assert
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });
});
