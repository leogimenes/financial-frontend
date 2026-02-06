'use client';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import SearchIcon from '@mui/icons-material/Search';
import CustomAppBar from '@/components/AppBar';
import DocumentCard from '@/components/DocumentCard';
import { getDocuments, deleteDocument } from '@/services/api';
import { Document } from '@/types';
import { useRequireAuth } from '@/contexts/AuthContext';

export default function DocumentosPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filtered, setFiltered] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('todos');
  const [bankFilter, setBankFilter] = useState('todos');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const fetchDocuments = async () => {
    if (!user) return;
    try {
      const { data } = await getDocuments(true);
      setDocuments(data);
      setFiltered(data);
    } catch {
      setSnackbar({ open: true, message: 'Erro ao carregar documentos', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchDocuments(); }, [user]);

  if (authLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  const applyFilters = () => {
    let result = documents;
    if (typeFilter !== 'todos') {
      result = result.filter(d => d.documentType === (typeFilter === 'fatura' ? 'fatura_cartao' : 'extrato_bancario'));
    }
    if (bankFilter !== 'todos') {
      result = result.filter(d => d.bankName?.toLowerCase().includes(bankFilter.toLowerCase()));
    }
    setFiltered(result);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id);
      setSnackbar({ open: true, message: 'Documento excluído', severity: 'success' });
      fetchDocuments();
    } catch {
      setSnackbar({ open: true, message: 'Erro ao excluir documento', severity: 'error' });
    }
  };

  const banks = [...new Set(documents.map(d => d.bankName).filter(Boolean))];

  return (
    <>
      <CustomAppBar />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>Documentos Processados</Typography>
          <Typography variant="body2" color="text.secondary">{filtered.length} documentos encontrados</Typography>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <Box sx={{ minWidth: 200 }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 500 }}>Tipo</Typography>
                <Select fullWidth size="small" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} sx={{ mt: 0.5 }}>
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="fatura">Fatura de Cartão</MenuItem>
                  <MenuItem value="extrato">Extrato Bancário</MenuItem>
                </Select>
              </Box>
              <Box sx={{ minWidth: 200 }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 500 }}>Banco</Typography>
                <Select fullWidth size="small" value={bankFilter} onChange={(e) => setBankFilter(e.target.value)} sx={{ mt: 0.5 }}>
                  <MenuItem value="todos">Todos</MenuItem>
                  {banks.map(bank => <MenuItem key={bank} value={bank}>{bank}</MenuItem>)}
                </Select>
              </Box>
              <Button variant="contained" startIcon={<SearchIcon />} onClick={applyFilters} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                Filtrar
              </Button>
            </Box>
          </CardContent>
        </Card>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
        ) : filtered.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 8, textAlign: 'center' }}>Nenhum documento encontrado</Typography>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 3 }}>
            {filtered.map((doc) => <DocumentCard key={doc.id} document={doc} onDelete={handleDelete} />)}
          </Box>
        )}
      </Container>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}
