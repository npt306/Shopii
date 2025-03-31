import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App'; // Assuming App includes ToastContainer

describe('App Component', () => {
  it('renders Vite + React heading', () => {
    render(<App />);
    // Check for the main heading
    expect(screen.getByRole('heading', { level: 1, name: /vite \+ react/i })).toBeInTheDocument();
    // Check if ToastContainer is rendered (it doesn't have an explicit role, check for structure/class if needed)
    // Simple check: Ensure no obvious errors during render.
  });

  it('renders ToastContainer', () => {
    render(<App />);
    // ToastContainer adds a div with class Toastify
    const toastContainers = document.querySelectorAll('.Toastify');
    expect(toastContainers.length).toBeGreaterThan(0);
  });
});
