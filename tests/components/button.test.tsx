/**
 * Component tests for the shadcn Button primitive.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies the default variant + size classes', () => {
    render(<Button>Default</Button>);
    const btn = screen.getByRole('button', { name: 'Default' });
    // default variant = bg-primary, default size = h-9 px-4
    expect(btn.className).toContain('bg-primary');
    expect(btn.className).toContain('h-9');
  });

  it('applies the destructive variant classes when variant="destructive"', () => {
    render(<Button variant="destructive">Delete</Button>);
    const btn = screen.getByRole('button', { name: 'Delete' });
    expect(btn.className).toContain('bg-destructive');
  });

  it('applies the outline variant classes when variant="outline"', () => {
    render(<Button variant="outline">Cancel</Button>);
    const btn = screen.getByRole('button', { name: 'Cancel' });
    expect(btn.className).toContain('bg-background');
    expect(btn.className).toContain('border');
  });

  it('applies the ghost variant classes when variant="ghost"', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole('button', { name: 'Ghost' });
    expect(btn.className).toContain('hover:bg-accent');
  });

  it('applies the link variant classes when variant="link"', () => {
    render(<Button variant="link">Link</Button>);
    const btn = screen.getByRole('button', { name: 'Link' });
    expect(btn.className).toContain('text-primary');
  });

  it('applies size="sm" classes', () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button').className).toContain('h-8');
  });

  it('applies size="lg" classes', () => {
    render(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button').className).toContain('h-10');
  });

  it('applies size="icon" classes', () => {
    render(
      <Button size="icon" aria-label="Action">
        <span aria-hidden>x</span>
      </Button>,
    );
    expect(screen.getByRole('button').className).toContain('size-9');
  });

  it('merges custom className onto the variant classes', () => {
    render(<Button className="my-custom">x</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('my-custom');
    // Default variant should still be applied.
    expect(btn.className).toContain('bg-primary');
  });

  it('fires the onClick handler when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Tap</Button>);
    await user.click(screen.getByRole('button', { name: 'Tap' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Tap
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Tap' });
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards arbitrary button props (type, aria-label, data-testid)', () => {
    render(
      <Button type="submit" aria-label="Save" data-testid="save-btn">
        Save
      </Button>,
    );
    const btn = screen.getByTestId('save-btn');
    expect(btn).toHaveAttribute('type', 'submit');
    expect(btn).toHaveAttribute('aria-label', 'Save');
  });

  it('renders as its child when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/somewhere">Link Button</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Link Button' });
    expect(link).toHaveAttribute('href', '/somewhere');
    // The link should still receive the button variant classes.
    expect(link.className).toContain('bg-primary');
  });
});
