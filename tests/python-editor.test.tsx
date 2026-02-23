import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PythonEditor } from '../components/python-editor/PythonEditor';

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: vi.fn(({ value, onChange }) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  )),
}));

describe('PythonEditor', () => {
  it('renders with default code', () => {
    render(<PythonEditor initialCode="print('hello')" />);
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });

  it('calls onChange when code changes', () => {
    const handleChange = vi.fn();
    render(<PythonEditor initialCode="" onChange={handleChange} />);
    
    const editor = screen.getByTestId('monaco-editor');
    fireEvent.change(editor, { target: { value: 'print("test")' } });
    
    expect(handleChange).toHaveBeenCalledWith('print("test")');
  });

  it('renders in readOnly mode', () => {
    render(<PythonEditor initialCode="test" readOnly />);
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });
});
