import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

describe('Card', () => {
  describe('Card component', () => {
    it('should render children', () => {
      // Arrange & Act
      render(
        <Card>
          <div data-testid="card-content">Card content</div>
        </Card>
      );

      // Assert
      expect(screen.getByTestId('card-content')).toBeInTheDocument();
    });

    it('should render with default variant', () => {
      // Arrange & Act
      const { container } = render(<Card>Default Card</Card>);

      // Assert
      expect(container.firstChild).toHaveClass('bg-white');
    });

    it('should render with interactive variant', () => {
      // Arrange & Act
      const { container } = render(<Card variant="interactive">Interactive</Card>);

      // Assert
      expect(container.firstChild).toHaveClass('cursor-pointer');
      expect(container.firstChild).toHaveClass('hover:shadow-lg');
    });

    it('should render with outlined variant', () => {
      // Arrange & Act
      const { container } = render(<Card variant="outlined">Outlined</Card>);

      // Assert
      expect(container.firstChild).toHaveClass('bg-transparent');
      expect(container.firstChild).toHaveClass('border-2');
    });

    it('should handle click events', () => {
      // Arrange
      const handleClick = vi.fn();
      render(<Card onClick={handleClick}>Clickable</Card>);

      // Act
      fireEvent.click(screen.getByText('Clickable'));

      // Assert
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should support custom className', () => {
      // Arrange & Act
      const { container } = render(<Card className="custom-card">Card</Card>);

      // Assert
      expect(container.firstChild).toHaveClass('custom-card');
    });

    it('should forward ref', () => {
      // Arrange
      const ref = { current: null as HTMLDivElement | null };
      render(<Card ref={ref}>Card</Card>);

      // Assert
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CardHeader', () => {
    it('should render children', () => {
      // Arrange & Act
      render(
        <Card>
          <CardHeader>Header Content</CardHeader>
        </Card>
      );

      // Assert
      expect(screen.getByText('Header Content')).toBeInTheDocument();
    });

    it('should have correct padding', () => {
      // Arrange & Act
      const { container } = render(
        <Card>
          <CardHeader>Header</CardHeader>
        </Card>
      );

      // Assert
      const header = container.querySelector('[class*="p-6"]');
      expect(header).toBeInTheDocument();
    });

    it('should support custom className', () => {
      // Arrange & Act
      const { container } = render(
        <Card>
          <CardHeader className="custom-header">Header</CardHeader>
        </Card>
      );

      // Assert
      const header = container.querySelector('.custom-header');
      expect(header).toBeInTheDocument();
    });
  });

  describe('CardTitle', () => {
    it('should render as h3 element', () => {
      // Arrange & Act
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
        </Card>
      );

      // Assert
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveTextContent('Card Title');
    });

    it('should have correct styling', () => {
      // Arrange & Act
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
        </Card>
      );

      // Assert
      const title = container.querySelector('h3');
      expect(title).toHaveClass('text-lg', 'font-semibold');
    });

    it('should support custom className', () => {
      // Arrange & Act
      render(
        <Card>
          <CardHeader>
            <CardTitle className="custom-title">Title</CardTitle>
          </CardHeader>
        </Card>
      );

      // Assert
      expect(screen.getByText('Title')).toHaveClass('custom-title');
    });
  });

  describe('CardDescription', () => {
    it('should render description text', () => {
      // Arrange & Act
      render(
        <Card>
          <CardHeader>
            <CardDescription>Card description text</CardDescription>
          </CardHeader>
        </Card>
      );

      // Assert
      expect(screen.getByText('Card description text')).toBeInTheDocument();
    });

    it('should render as paragraph', () => {
      // Arrange & Act
      render(
        <Card>
          <CardHeader>
            <CardDescription>Description</CardDescription>
          </CardHeader>
        </Card>
      );

      // Assert
      const description = screen.getByText('Description');
      expect(description.tagName).toBe('P');
    });

    it('should have correct styling', () => {
      // Arrange & Act
      const { container } = render(
        <Card>
          <CardHeader>
            <CardDescription>Description</CardDescription>
          </CardHeader>
        </Card>
      );

      // Assert
      const description = container.querySelector('p');
      expect(description).toHaveClass('text-sm', 'text-gray-500');
    });
  });

  describe('CardContent', () => {
    it('should render content', () => {
      // Arrange & Act
      render(
        <Card>
          <CardContent>Main content here</CardContent>
        </Card>
      );

      // Assert
      expect(screen.getByText('Main content here')).toBeInTheDocument();
    });

    it('should have correct padding', () => {
      // Arrange & Act
      const { container } = render(
        <Card>
          <CardContent>Content</CardContent>
        </Card>
      );

      // Assert
      const content = container.querySelector('[class*="p-6"]');
      expect(content).toBeInTheDocument();
    });

    it('should apply first:pt-6 when no header', () => {
      // Arrange & Act
      const { container } = render(
        <Card>
          <CardContent>No header content</CardContent>
        </Card>
      );

      // Assert
      const content = container.querySelector('[class*="first:pt-6"]');
      expect(content).toBeInTheDocument();
    });
  });

  describe('CardFooter', () => {
    it('should render footer content', () => {
      // Arrange & Act
      render(
        <Card>
          <CardFooter>Footer actions</CardFooter>
        </Card>
      );

      // Assert
      expect(screen.getByText('Footer actions')).toBeInTheDocument();
    });

    it('should have flex layout', () => {
      // Arrange & Act
      const { container } = render(
        <Card>
          <CardFooter>Footer</CardFooter>
        </Card>
      );

      // Assert
      const footer = container.querySelector('[class*="flex"]');
      expect(footer).toBeInTheDocument();
    });

    it('should support custom className', () => {
      // Arrange & Act
      const { container } = render(
        <Card>
          <CardFooter className="custom-footer">Footer</CardFooter>
        </Card>
      );

      // Assert
      const footer = container.querySelector('.custom-footer');
      expect(footer).toBeInTheDocument();
    });
  });

  describe('complete card structure', () => {
    it('should render complete card with all sections', () => {
      // Arrange & Act
      render(
        <Card>
          <CardHeader>
            <CardTitle>Complete Card</CardTitle>
            <CardDescription>This is a complete card example</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      );

      // Assert
      expect(screen.getByText('Complete Card')).toBeInTheDocument();
      expect(screen.getByText('This is a complete card example')).toBeInTheDocument();
      expect(screen.getByText('Main content goes here')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });

    it('should render card with only content (no header/footer)', () => {
      // Arrange & Act
      render(
        <Card>
          <CardContent>Simple card content</CardContent>
        </Card>
      );

      // Assert
      expect(screen.getByText('Simple card content')).toBeInTheDocument();
    });
  });
});
