'use client';
import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface UploadZoneProps {
  onFileSelect: (files: File[]) => void;
}

export default function UploadZone({ onFileSelect }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    onFileSelect(files);
  }, [onFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      onFileSelect(files);
    }
  };

  return (
    <Box
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        border: '2px dashed',
        borderColor: isDragging ? 'primary.main' : '#bdbdbd',
        borderRadius: 3,
        p: 8,
        textAlign: 'center',
        backgroundColor: isDragging ? '#f3f0ff' : '#fafafa',
        transition: 'all 0.3s',
        cursor: 'pointer',
      }}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <CloudUploadIcon sx={{ fontSize: 72, color: '#9e9e9e', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Arraste seus arquivos aqui
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        ou clique para selecionar
      </Typography>
      <Button
        variant="contained"
        startIcon={<CloudUploadIcon />}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        Selecionar Arquivos
      </Button>
      <input
        id="file-input"
        type="file"
        multiple
        accept=".csv,.pdf,.jpg,.jpeg,.png,.gif,.webp,image/*"
        style={{ display: 'none' }}
        onChange={handleFileInput}
      />
    </Box>
  );
}
