import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Simple Button component test
const Button = ({ onClick, children, ...props }: any) => (
  <button onClick={onClick} {...props}>
    {children}
  </button>
);

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom props', () => {
    render(<Button data-testid="custom-button" disabled>Disabled</Button>);
    const button = screen.getByTestId('custom-button');
    expect(button).toBeDisabled();
  });
});