import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ThemeRegistry from './ThemeRegistry';

describe('ThemeRegistry', () => {
  it('should render children with theme', () => {
    render(
      <ThemeRegistry>
        <div>Themed content</div>
      </ThemeRegistry>
    );
    expect(screen.getByText('Themed content')).toBeInTheDocument();
  });
});
