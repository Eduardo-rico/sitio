import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Avatar, AvatarGroup } from '@/components/ui/avatar';

describe('Avatar', () => {
  describe('with image', () => {
    it('should render image when src is provided', () => {
      // Arrange & Act
      render(<Avatar src="/avatar.jpg" name="John Doe" />);

      // Assert
      const img = screen.getByRole('img', { name: 'John Doe' });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/avatar.jpg');
    });

    it('should use name as alt text when alt is not provided', () => {
      // Arrange & Act
      render(<Avatar src="/avatar.jpg" name="Jane Smith" />);

      // Assert
      expect(screen.getByRole('img', { name: 'Jane Smith' })).toBeInTheDocument();
    });

    it('should use alt text when provided', () => {
      // Arrange & Act
      render(<Avatar src="/avatar.jpg" name="John" alt="Profile picture" />);

      // Assert
      expect(screen.getByRole('img', { name: 'Profile picture' })).toBeInTheDocument();
    });

    it('should show fallback when image fails to load', async () => {
      // Arrange
      render(<Avatar src="/invalid.jpg" name="John Doe" />);
      const img = screen.getByRole('img');

      // Act
      fireEvent.error(img);

      // Assert - should show fallback with initials
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('fallback', () => {
    it('should show fallback with initials when no src', () => {
      // Arrange & Act
      render(<Avatar name="John Doe" />);

      // Assert
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should show single initial for single name', () => {
      // Arrange & Act
      render(<Avatar name="John" />);

      // Assert
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('should show two initials for multi-word name', () => {
      // Arrange & Act
      render(<Avatar name="John Jacob Jingleheimer Schmidt" />);

      // Assert
      expect(screen.getByText('JJ')).toBeInTheDocument();
    });

    it('should convert initials to uppercase', () => {
      // Arrange & Act
      render(<Avatar name="john doe" />);

      // Assert
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should show question mark when no name or src', () => {
      // Arrange & Act
      render(<Avatar />);

      // Assert
      expect(screen.getByText('?')).toBeInTheDocument();
    });

    it('should show question mark for empty name', () => {
      // Arrange & Act
      render(<Avatar name="" />);

      // Assert
      expect(screen.getByText('?')).toBeInTheDocument();
    });

    it('should apply gradient background to fallback', () => {
      // Arrange & Act
      const { container } = render(<Avatar name="John Doe" />);

      // Assert
      const innerDiv = container.querySelector('[class*="bg-gradient-to-br"]');
      expect(innerDiv).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('should render small size', () => {
      // Arrange & Act
      const { container } = render(<Avatar size="sm" name="Test" />);

      // Assert - size classes are on the inner div
      const innerDiv = container.querySelector('.h-8.w-8');
      expect(innerDiv).toBeInTheDocument();
    });

    it('should render medium size (default)', () => {
      // Arrange & Act
      const { container } = render(<Avatar name="Test" />);

      // Assert
      const innerDiv = container.querySelector('.h-10.w-10');
      expect(innerDiv).toBeInTheDocument();
    });

    it('should render large size', () => {
      // Arrange & Act
      const { container } = render(<Avatar size="lg" name="Test" />);

      // Assert
      const innerDiv = container.querySelector('.h-12.w-12');
      expect(innerDiv).toBeInTheDocument();
    });

    it('should render extra large size', () => {
      // Arrange & Act
      const { container } = render(<Avatar size="xl" name="Test" />);

      // Assert
      const innerDiv = container.querySelector('.h-16.w-16');
      expect(innerDiv).toBeInTheDocument();
    });
  });

  describe('status indicator', () => {
    it('should show online status', () => {
      // Arrange & Act
      render(<Avatar name="Test" status="online" />);

      // Assert
      expect(screen.getByLabelText('Status: online')).toBeInTheDocument();
    });

    it('should show offline status', () => {
      // Arrange & Act
      render(<Avatar name="Test" status="offline" />);

      // Assert
      expect(screen.getByLabelText('Status: offline')).toBeInTheDocument();
    });

    it('should show away status', () => {
      // Arrange & Act
      render(<Avatar name="Test" status="away" />);

      // Assert
      expect(screen.getByLabelText('Status: away')).toBeInTheDocument();
    });

    it('should show busy status', () => {
      // Arrange & Act
      render(<Avatar name="Test" status="busy" />);

      // Assert
      expect(screen.getByLabelText('Status: busy')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should support custom className', () => {
      // Arrange & Act
      const { container } = render(<Avatar name="Test" className="custom-class" />);

      // Assert
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should forward ref', () => {
      // Arrange
      const ref = { current: null as HTMLDivElement | null };
      render(<Avatar ref={ref} name="Test" />);

      // Assert
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('custom fallback', () => {
    it('should render custom fallback content', () => {
      // Arrange & Act
      render(<Avatar fallback={<span data-testid="custom-fallback">CF</span>} />);

      // Assert
      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    });
  });
});

describe('AvatarGroup', () => {
  it('should render multiple avatars', () => {
    // Arrange & Act
    render(
      <AvatarGroup>
        <Avatar name="User 1" />
        <Avatar name="User 2" />
        <Avatar name="User 3" />
      </AvatarGroup>
    );

    // Assert
    expect(screen.getByText('U1')).toBeInTheDocument();
    expect(screen.getByText('U2')).toBeInTheDocument();
    expect(screen.getByText('U3')).toBeInTheDocument();
  });

  it('should show remaining count when max is exceeded', () => {
    // Arrange & Act
    render(
      <AvatarGroup max={2}>
        <Avatar name="User 1" />
        <Avatar name="User 2" />
        <Avatar name="User 3" />
        <Avatar name="User 4" />
      </AvatarGroup>
    );

    // Assert
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('should support different spacing', () => {
    // Arrange & Act
    const { container, rerender } = render(
      <AvatarGroup spacing="tight">
        <Avatar name="User 1" />
      </AvatarGroup>
    );
    expect(container.firstChild).toHaveClass('-space-x-2');

    rerender(
      <AvatarGroup spacing="normal">
        <Avatar name="User 1" />
      </AvatarGroup>
    );
    expect(container.firstChild).toHaveClass('-space-x-1');

    rerender(
      <AvatarGroup spacing="loose">
        <Avatar name="User 1" />
      </AvatarGroup>
    );
    expect(container.firstChild).toHaveClass('space-x-1');
  });
});
