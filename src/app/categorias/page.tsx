'use client';
import { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Button, Grid, Card, CardContent, CardActions,
  Chip, IconButton, Alert, CircularProgress, Snackbar, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, RadioGroup, FormControlLabel, Radio,
  FormControl, FormLabel, DialogContentText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import CustomAppBar from '@/components/AppBar';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/services/api';
import { Category } from '@/types';
import { useWideEvent } from '@/hooks/useWideEvent';

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; categoryId: string | null }>({ open: false, categoryId: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [formData, setFormData] = useState({ name: '', type: 'expense' as 'expense' | 'income', color: '#667eea', keywords: '' });
  const { log, flush } = useWideEvent('categories_page');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
      log('categories.loaded', res.data.length);
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Erro ao carregar categorias', severity: 'error' });
    } finally {
      setLoading(false);
      flush();
    }
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      const keywords = category.keywords ? JSON.parse(category.keywords).join('\n') : '';
      setFormData({ name: category.name, type: category.type, color: category.color || '#667eea', keywords });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', type: 'expense', color: '#667eea', keywords: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async () => {
    try {
      const keywordsArray = formData.keywords.split('\n').map(k => k.trim()).filter(k => k);
      if (!formData.name || keywordsArray.length === 0) {
        setSnackbar({ open: true, message: 'Nome e palavras-chave são obrigatórios', severity: 'error' });
        return;
      }

      if (editingCategory) {
        await updateCategory(editingCategory.id, { ...formData, keywords: keywordsArray });
        setSnackbar({ open: true, message: 'Categoria atualizada com sucesso', severity: 'success' });
        log('category.updated', editingCategory.id);
      } else {
        await createCategory({ ...formData, keywords: keywordsArray });
        setSnackbar({ open: true, message: 'Categoria criada com sucesso', severity: 'success' });
        log('category.created', formData.name);
      }
      handleCloseDialog();
      loadCategories();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Erro ao salvar categoria', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.categoryId) return;
    try {
      await deleteCategory(deleteDialog.categoryId);
      setSnackbar({ open: true, message: 'Categoria excluída com sucesso', severity: 'success' });
      log('category.deleted', deleteDialog.categoryId);
      loadCategories();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao excluir categoria';
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, categoryId: null });
    }
  };

  const globalCategories = categories.filter(c => !c.userId);
  const customCategories = categories.filter(c => c.userId);

  if (loading) return <><CustomAppBar /><Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box></>;

  return (
    <>
      <CustomAppBar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">Categorias</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Nova Categoria
          </Button>
        </Box>

        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockIcon fontSize="small" /> Categorias do Sistema
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {globalCategories.map(cat => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cat.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: cat.color }} />
                    <Typography variant="h6">{cat.name}</Typography>
                  </Box>
                  <Chip label={cat.type === 'expense' ? 'Despesa' : 'Receita'} size="small" sx={{ mb: 1 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {cat.keywords ? JSON.parse(cat.keywords).slice(0, 3).join(', ') : 'Sem palavras-chave'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon fontSize="small" /> Minhas Categorias
        </Typography>
        {customCategories.length === 0 ? (
          <Alert severity="info">Você ainda não criou categorias personalizadas</Alert>
        ) : (
          <Grid container spacing={2}>
            {customCategories.map(cat => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cat.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: cat.color }} />
                      <Typography variant="h6">{cat.name}</Typography>
                    </Box>
                    <Chip label={cat.type === 'expense' ? 'Despesa' : 'Receita'} size="small" sx={{ mb: 1 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {cat.keywords ? JSON.parse(cat.keywords).slice(0, 3).join(', ') : 'Sem palavras-chave'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton size="small" onClick={() => handleOpenDialog(cat)}><EditIcon /></IconButton>
                    <IconButton size="small" onClick={() => setDeleteDialog({ open: true, categoryId: cat.id })}><DeleteIcon /></IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
            required
          />
          <TextField
            label="Cor"
            type="color"
            fullWidth
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            sx={{ mb: 2 }}
            required
          />
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel>Tipo</FormLabel>
            <RadioGroup row value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as 'expense' | 'income' })}>
              <FormControlLabel value="expense" control={<Radio />} label="Despesa" />
              <FormControlLabel value="income" control={<Radio />} label="Receita" />
            </RadioGroup>
          </FormControl>
          <TextField
            label="Palavras-chave (uma por linha)"
            fullWidth
            multiline
            rows={4}
            value={formData.keywords}
            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            helperText="Digite uma palavra-chave por linha para auto-classificação"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, categoryId: null })}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
            {' '}Se houver transações usando esta categoria, a exclusão será bloqueada.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, categoryId: null })}>Cancelar</Button>
          <Button onClick={handleDelete} variant="contained" color="error">Excluir</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
