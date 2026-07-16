/**
 * Component tests for the shadcn Input primitive.
 */
import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/input';

describe('Input', () => {
  it('renders a text input by default', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
  });

  it('renders the type attribute correctly', () => {
    render(<Input type="email" aria-label="Email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('forwards the placeholder', () => {
    render(<Input placeholder="you@example.com" />);
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  it('forwards the value', () => {
    render(<Input defaultValue="hello" aria-label="Field" />);
    expect(screen.getByLabelText('Field')).toHaveValue('hello');
  });

  it('fires onChange when the user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input aria-label="Name" onChange={onChange} />);
    const input = screen.getByLabelText('Name');
    await user.type(input, 'a');
    expect(onChange).toHaveBeenCalled();
    expect(input).toHaveValue('a');
  });

  it('supports controlled value updates', async () => {
    function ControlledInput() {
      const [val, setVal] = React.useState('');
      return <Input aria-label="Controlled" value={val} onChange={(e) => setVal(e.target.value)} />;
    }

    const user = userEvent.setup();
    render(<ControlledInput />);
    const input = screen.getByLabelText('Controlled');
    await user.type(input, 'hello');
    expect(input).toHaveValue('hello');
  });

  it('applies custom className alongside the base classes', () => {
    render(<Input className="my-class" aria-label="X" />);
    const input = screen.getByLabelText('X');
    expect(input.className).toContain('my-class');
    expect(input.className).toContain('border-input');
  });

  it('marks the input as disabled when the disabled prop is set', () => {
    render(<Input disabled aria-label="X" />);
    expect(screen.getByLabelText('X')).toBeDisabled();
  });

  it('marks the input as required when the required prop is set', () => {
    render(<Input required aria-label="X" />);
    expect(screen.getByLabelText('X')).toHaveAttribute('required');
  });

  it('passes through data-* attributes', () => {
    render(<Input data-testid="my-input" aria-label="X" />);
    expect(screen.getByTestId('my-input')).toBeInTheDocument();
  });

  it('sets aria-invalid when the aria-invalid prop is true', () => {
    render(<Input aria-invalid={true} aria-label="X" />);
    expect(screen.getByLabelText('X')).toHaveAttribute('aria-invalid', 'true');
  });
});
