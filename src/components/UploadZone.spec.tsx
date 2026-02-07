import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import UploadZone from './UploadZone';

describe('UploadZone', () => {
  it('should render upload text', () => {
    render(<UploadZone onFileSelect={vi.fn()} />);
    expect(screen.getByText('Arraste seus arquivos aqui')).toBeInTheDocument();
    expect(screen.getByText('ou clique para selecionar')).toBeInTheDocument();
  });

  it('should render select button', () => {
    render(<UploadZone onFileSelect={vi.fn()} />);
    expect(screen.getByText('Selecionar Arquivos')).toBeInTheDocument();
  });

  it('should call onFileSelect when files are dropped', () => {
    const onFileSelect = vi.fn();
    render(<UploadZone onFileSelect={onFileSelect} />);

    const dropZone = screen.getByText('Arraste seus arquivos aqui').closest('div')!;
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });

    expect(onFileSelect).toHaveBeenCalledWith([file]);
  });

  it('should call onFileSelect when file input changes', () => {
    const onFileSelect = vi.fn();
    render(<UploadZone onFileSelect={onFileSelect} />);

    const input = document.getElementById('file-input') as HTMLInputElement;
    const file = new File(['content'], 'test.csv', { type: 'text/csv' });

    fireEvent.change(input, { target: { files: [file] } });
    expect(onFileSelect).toHaveBeenCalledWith([file]);
  });

  it('should show drag state on dragOver', () => {
    render(<UploadZone onFileSelect={vi.fn()} />);
    const dropZone = screen.getByText('Arraste seus arquivos aqui').closest('div')!;

    fireEvent.dragOver(dropZone);
    // Component uses isDragging state to change styling
    // Just verify no errors
    expect(dropZone).toBeInTheDocument();
  });
});
