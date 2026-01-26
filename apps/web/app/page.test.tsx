import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Page from './page';

// Mock fetch globally
global.fetch = vi.fn();

describe('Web App Unit Test', () => {
  it('renders the main heading', () => {
    render(<Page />);
    const heading = screen.getByText(/Football Oracle/i);
    expect(heading).toBeDefined();
  });
});
