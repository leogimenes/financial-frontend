import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import CategoryChip from './CategoryChip';

describe('CategoryChip', () => {
  it('should render category name', () => {
    render(<CategoryChip category={{ id: '1', name: 'Mercado', type: 'expense', color: '#4CAF50' }} />);
    expect(screen.getByText('Mercado')).toBeInTheDocument();
  });

  it('should render with name prop', () => {
    render(<CategoryChip name="Alimentação" />);
    expect(screen.getByText('Alimentação')).toBeInTheDocument();
  });

  it('should fall back to Outros when no category or name', () => {
    render(<CategoryChip />);
    expect(screen.getByText('Outros')).toBeInTheDocument();
  });

  it('should use category icon mapping', () => {
    render(<CategoryChip category={{ id: '1', name: 'Custom', type: 'expense', icon: 'shopping_cart' }} />);
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('should handle null category', () => {
    render(<CategoryChip category={null} />);
    expect(screen.getByText('Outros')).toBeInTheDocument();
  });
});
