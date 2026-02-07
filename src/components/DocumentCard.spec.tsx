import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import DocumentCard from './DocumentCard';
import { Document } from '@/types';

const baseFatura: Document = {
  id: 'doc-1',
  fileName: 'fatura.pdf',
  fileType: 'pdf',
  fileSize: 1024,
  documentType: 'fatura_cartao',
  status: 'completed',
  bankName: 'Nubank',
  cardNumberMasked: '****1234',
  totalAmount: 500,
  dueDate: '2024-07-10',
  closingDate: '2024-06-15',
  createdAt: '2024-06-01T00:00:00.000Z',
  transactions: [],
};

const baseExtrato: Document = {
  id: 'doc-2',
  fileName: 'extrato.pdf',
  fileType: 'pdf',
  fileSize: 2048,
  documentType: 'extrato_bancario',
  status: 'completed',
  bankName: 'Itaú',
  accountAgency: '0001',
  accountNumber: '12345',
  initialBalance: 1000,
  finalBalance: 2000,
  createdAt: '2024-06-01T00:00:00.000Z',
  transactions: [],
};

describe('DocumentCard', () => {
  it('should render bank name', () => {
    render(<DocumentCard document={baseFatura} />);
    expect(screen.getByText('Nubank')).toBeInTheDocument();
  });

  it('should show Fatura chip for fatura_cartao', () => {
    render(<DocumentCard document={baseFatura} />);
    expect(screen.getByText('Fatura')).toBeInTheDocument();
  });

  it('should show Extrato chip for extrato_bancario', () => {
    render(<DocumentCard document={baseExtrato} />);
    expect(screen.getByText('Extrato')).toBeInTheDocument();
  });

  it('should show transaction count', () => {
    render(<DocumentCard document={baseFatura} />);
    expect(screen.getByText('0 lançamentos')).toBeInTheDocument();
  });

  it('should show menu with options', () => {
    render(<DocumentCard document={baseFatura} onDelete={vi.fn()} />);
    const menuButton = screen.getByTestId('MoreVertIcon').closest('button')!;
    fireEvent.click(menuButton);
    expect(screen.getByText('Editar')).toBeInTheDocument();
    expect(screen.getByText('Excluir')).toBeInTheDocument();
  });

  it('should call onDelete when delete is clicked', () => {
    const onDelete = vi.fn();
    render(<DocumentCard document={baseFatura} onDelete={onDelete} />);
    const menuButton = screen.getByTestId('MoreVertIcon').closest('button')!;
    fireEvent.click(menuButton);
    fireEvent.click(screen.getByText('Excluir'));
    expect(onDelete).toHaveBeenCalledWith('doc-1');
  });

  it('should display fileName when bankName is missing', () => {
    render(<DocumentCard document={{ ...baseFatura, bankName: undefined }} />);
    expect(screen.getByText('fatura.pdf')).toBeInTheDocument();
  });
});
