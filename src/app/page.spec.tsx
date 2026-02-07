import { describe, it, expect, vi } from 'vitest';
import { render } from '@/test/test-utils';
import Home from './page';

describe('Home', () => {
  it('should redirect to /upload', () => {
    render(<Home />);
    const { push } = (globalThis as any).__mockRouter;
    expect(push).toHaveBeenCalledWith('/upload');
  });
});
