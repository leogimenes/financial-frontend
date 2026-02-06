'use client';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import CustomAppBar from '@/components/AppBar';
import UploadZone from '@/components/UploadZone';
import { uploadDocument, getDocuments } from '@/services/api';
import { Document } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRequireAuth } from '@/contexts/AuthContext';

export default function UploadPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const fetchDocuments = async () => {
    if (!user) return;
    try {
      const { data } = await getDocuments();
      setDocuments(data);
    } catch {
      setSnackbar({ open: true, message: 'Erro ao carregar documentos', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchDocuments();
  }, [user]);

  if (authLoading || !user) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><CircularProgress /></Box>;
  }

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;
    setUploading(true);
    try {
      const { data } = await uploadDocument(files[0]);
      setSnackbar({ open: true, message: `Arquivo "${data.fileName}" enviado com sucesso!`, severity: 'success' });
      fetchDocuments();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao enviar arquivo';
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => `${Math.round(bytes / 1024)} KB`;

  const getStatusChip = (status: string) => {
    const configs = {
      pending: { icon: <PendingIcon />, label: 'Pendente', color: 'default' as const },
      processing: { icon: <PendingIcon />, label: 'Processando', color: 'warning' as const },
      completed: { icon: <CheckCircleIcon />, label: 'Concluído', color: 'success' as const },
      error: { icon: <ErrorIcon />, label: 'Erro', color: 'error' as const },
    };
    const config = configs[status as keyof typeof configs] || configs.pending;
    return <Chip icon={config.icon} label={config.label} color={config.color} size="small" />;
  };

  return (
    <>
      <CustomAppBar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 6 }}>
            {uploading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                <CircularProgress size={48} />
                <Typography sx={{ mt: 2 }}>Enviando arquivo...</Typography>
              </Box>
            ) : (
              <UploadZone onFileSelect={handleFileSelect} />
            )}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4, pt: 4, borderTop: 1, borderColor: 'divider', flexWrap: 'wrap' }}>
              <Chip icon={<DescriptionIcon />} label="CSV" sx={{ bgcolor: '#e8eaf6', color: '#5e35b1' }} />
              <Chip icon={<PictureAsPdfIcon />} label="PDF" sx={{ bgcolor: '#e8eaf6', color: '#5e35b1' }} />
              <Chip icon={<CreditCardIcon />} label="Imagens (JPG, PNG)" sx={{ bgcolor: '#e8eaf6', color: '#5e35b1' }} />
              <Chip icon={<AccountBalanceIcon />} label="Faturas e Extratos" sx={{ bgcolor: '#e8eaf6', color: '#5e35b1' }} />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Uploads Recentes
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : documents.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                Nenhum documento enviado ainda
              </Typography>
            ) : (
              <List>
                {documents.slice(0, 5).map((doc) => (
                  <ListItem
                    key={doc.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      mb: 1.5,
                      '&:hover': { borderColor: 'primary.main', boxShadow: 1 },
                    }}
                    secondaryAction={getStatusChip(doc.status)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        {doc.fileType === 'pdf' ? 'PDF' : 'CSV'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={doc.fileName}
                      secondary={`Enviado ${formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true, locale: ptBR })} • ${formatFileSize(doc.fileSize)}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Container>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}
