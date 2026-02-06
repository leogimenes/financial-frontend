'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomAppBar from '@/components/AppBar';
import { getDocument, updateDocument, getCategories, updateTransaction, createTransaction, deleteTransaction, createCategory, getSuggestedTransactions, linkDocumentTransaction, dismissSuggestion, getTransactions } from '@/services/api';
import { Document, Transaction, Category } from '@/types';
import { format } from 'date-fns';
import { useRequireAuth } from '@/contexts/AuthContext';

export default function DocumentEditPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [doc, setDoc] = useState<Document | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [txDialog, setTxDialog] = useState<{ open: boolean; tx: Partial<Transaction> | null }>({ open: false, tx: null });
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', type: 'expense' as 'expense' | 'income', color: '#667eea', keywords: '' });
  const [suggestedTransactions, setSuggestedTransactions] = useState<Transaction[]>([]);
  const [linkDialog, setLinkDialog] = useState(false);
  const [manualLinkDialog, setManualLinkDialog] = useState(false);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;
    Promise.all([getDocument(id), getCategories(), getSuggestedTransactions(id).catch(() => ({ data: [] })), getTransactions().catch(() => ({ data: [] }))])
      .then(([docRes, catRes, sugRes, txRes]) => { 
        setDoc(docRes.data); 
        setCategories(catRes.data); 
        setSuggestedTransactions(sugRes.data);
        setAllTransactions(txRes.data);
      })
      .catch(() => setSnackbar({ open: true, message: 'Erro ao carregar documento', severity: 'error' }))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleDocChange = (field: keyof Document, value: string | number) => {
    if (doc) setDoc({ ...doc, [field]: value });
  };

  const handleSaveDoc = async () => {
    if (!doc) return;
    setSaving(true);
    try {
      const { bankName, cardNumberMasked, accountAgency, accountNumber, totalAmount, creditLimit, initialBalance, finalBalance, closingDate, dueDate, periodStart, periodEnd } = doc;
      await updateDocument(id, { bankName, cardNumberMasked, accountAgency, accountNumber, totalAmount, creditLimit, initialBalance, finalBalance, closingDate, dueDate, periodStart, periodEnd });
      setSnackbar({ open: true, message: 'Documento salvo', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Erro ao salvar', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTx = async () => {
    const tx = txDialog.tx;
    if (!tx || !doc) return;
    setSaving(true);
    try {
      if (tx.id) {
        await updateTransaction(tx.id, { date: tx.date, description: tx.description, amount: tx.amount, type: tx.type, categoryId: tx.categoryId, merchant: tx.merchant });
      } else {
        await createTransaction({ documentId: id, date: tx.date!, description: tx.description!, amount: tx.amount!, type: tx.type!, categoryId: tx.categoryId, merchant: tx.merchant });
      }
      const { data } = await getDocument(id);
      setDoc(data);
      setTxDialog({ open: false, tx: null });
      setSnackbar({ open: true, message: 'Lançamento salvo', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Erro ao salvar lançamento', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTx = async (txId: string) => {
    if (!confirm('Excluir este lançamento?')) return;
    try {
      await deleteTransaction(txId);
      const { data } = await getDocument(id);
      setDoc(data);
      setSnackbar({ open: true, message: 'Lançamento excluído', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Erro ao excluir', severity: 'error' });
    }
  };

  const handleCreateCategory = async () => {
    try {
      const keywordsArray = categoryForm.keywords.split('\n').map(k => k.trim()).filter(k => k);
      if (!categoryForm.name || keywordsArray.length === 0) {
        setSnackbar({ open: true, message: 'Nome e palavras-chave são obrigatórios', severity: 'error' });
        return;
      }
      const { data: newCategory } = await createCategory({ ...categoryForm, keywords: keywordsArray });
      const { data: updatedCategories } = await getCategories();
      setCategories(updatedCategories);
      setTxDialog({ ...txDialog, tx: { ...txDialog.tx, categoryId: newCategory.id } });
      setCategoryDialog(false);
      setCategoryForm({ name: '', type: 'expense', color: '#667eea', keywords: '' });
      setSnackbar({ open: true, message: 'Categoria criada com sucesso', severity: 'success' });
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Erro ao criar categoria', severity: 'error' });
    }
  };

  const handleLinkTransaction = async (transactionId: string) => {
    try {
      await linkDocumentTransaction(id, transactionId);
      setSnackbar({ open: true, message: 'Documento vinculado com sucesso', severity: 'success' });
      setLinkDialog(false);
      setManualLinkDialog(false);
      const { data: updatedDoc } = await getDocument(id);
      setDoc(updatedDoc);
      const { data: suggestions } = await getSuggestedTransactions(id).catch(() => ({ data: [] }));
      setSuggestedTransactions(suggestions);
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Erro ao vincular', severity: 'error' });
    }
  };

  const handleDismiss = async (transactionId: string) => {
    try {
      await dismissSuggestion(id, transactionId);
      const { data: suggestions } = await getSuggestedTransactions(id);
      setSuggestedTransactions(suggestions);
      setSnackbar({ open: true, message: 'Sugestão descartada', severity: 'success' });
    } catch (error: any) {
      setSnackbar({ open: true, message: 'Erro ao descartar', severity: 'error' });
    }
  };

  const isFatura = doc?.documentType === 'fatura_cartao';
  const calculatedTotal = doc?.transactions?.reduce((sum, tx) => sum + (tx.type === 'debit' ? tx.amount : -tx.amount), 0) || 0;

  if (authLoading || !user) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><CircularProgress /></Box>;
  if (loading) return <><CustomAppBar /><Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box></>;
  if (!doc) return <><CustomAppBar /><Container><Alert severity="error">Documento não encontrado</Alert></Container></>;

  return (
    <>
      <CustomAppBar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => router.push('/documents')}><ArrowBackIcon /></IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5">Editar Documento</Typography>
            <Typography variant="body2" color="text.secondary">{doc.fileName}</Typography>
          </Box>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveDoc} disabled={saving} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            Salvar
          </Button>
        </Box>

        {isFatura && doc.totalAmount && Math.abs(calculatedTotal - doc.totalAmount) > 0.01 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Valor calculado (R$ {calculatedTotal.toFixed(2)}) difere do valor extraído (R$ {doc.totalAmount.toFixed(2)})
          </Alert>
        )}

        {suggestedTransactions.length > 0 && !doc.linkedTransactionId && (
          <Alert severity="info" sx={{ mb: 2 }} action={
            <>
              <Button size="small" onClick={() => setLinkDialog(true)}>Ver Sugestões</Button>
              <Button size="small" onClick={() => setManualLinkDialog(true)}>Vincular Manualmente</Button>
            </>
          }>
            Este documento pode estar relacionado a {suggestedTransactions.length} transação(ões)
          </Alert>
        )}

        {suggestedTransactions.length === 0 && !doc.linkedTransactionId && (
          <Alert severity="info" sx={{ mb: 2 }} action={
            <Button size="small" onClick={() => setManualLinkDialog(true)}>Vincular Manualmente</Button>
          }>
            Nenhuma sugestão automática encontrada. Você pode vincular manualmente a uma transação.
          </Alert>
        )}

        {doc.linkedTransactionId && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Documento vinculado a uma transação
          </Alert>
        )}

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Informações do Documento</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
              <TextField label="Banco" size="small" value={doc.bankName || ''} onChange={(e) => handleDocChange('bankName', e.target.value)} />
              {isFatura ? (
                <>
                  <TextField label="Cartão (mascarado)" size="small" value={doc.cardNumberMasked || ''} onChange={(e) => handleDocChange('cardNumberMasked', e.target.value)} />
                  <TextField label="Valor Extraído" size="small" type="number" value={doc.totalAmount || ''} onChange={(e) => handleDocChange('totalAmount', parseFloat(e.target.value))} />
                  <TextField label="Valor Calculado" size="small" value={calculatedTotal.toFixed(2)} disabled />
                  <TextField label="Limite" size="small" type="number" value={doc.creditLimit || ''} onChange={(e) => handleDocChange('creditLimit', parseFloat(e.target.value))} />
                  <TextField label="Fechamento" size="small" type="date" InputLabelProps={{ shrink: true }} value={doc.closingDate?.split('T')[0] || ''} onChange={(e) => handleDocChange('closingDate', e.target.value)} />
                  <TextField label="Vencimento" size="small" type="date" InputLabelProps={{ shrink: true }} value={doc.dueDate?.split('T')[0] || ''} onChange={(e) => handleDocChange('dueDate', e.target.value)} />
                </>
              ) : (
                <>
                  <TextField label="Agência" size="small" value={doc.accountAgency || ''} onChange={(e) => handleDocChange('accountAgency', e.target.value)} />
                  <TextField label="Conta" size="small" value={doc.accountNumber || ''} onChange={(e) => handleDocChange('accountNumber', e.target.value)} />
                  <TextField label="Saldo Inicial" size="small" type="number" value={doc.initialBalance || ''} onChange={(e) => handleDocChange('initialBalance', parseFloat(e.target.value))} />
                  <TextField label="Saldo Final" size="small" type="number" value={doc.finalBalance || ''} onChange={(e) => handleDocChange('finalBalance', parseFloat(e.target.value))} />
                  <TextField label="Período Início" size="small" type="date" InputLabelProps={{ shrink: true }} value={doc.periodStart?.split('T')[0] || ''} onChange={(e) => handleDocChange('periodStart', e.target.value)} />
                  <TextField label="Período Fim" size="small" type="date" InputLabelProps={{ shrink: true }} value={doc.periodEnd?.split('T')[0] || ''} onChange={(e) => handleDocChange('periodEnd', e.target.value)} />
                </>
              )}
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Lançamentos ({doc.transactions?.length || 0})</Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={() => setTxDialog({ open: true, tx: { date: format(new Date(), 'yyyy-MM-dd'), description: '', amount: 0, type: 'debit' } })}>
                Adicionar
              </Button>
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell align="right">Valor</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {doc.transactions?.map((tx) => (
                  <TableRow key={tx.id} hover>
                    <TableCell>{format(new Date(tx.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell><Chip label={tx.category?.name || '-'} size="small" sx={{ bgcolor: tx.category?.color || '#e0e0e0', color: '#fff', fontSize: 11 }} /></TableCell>
                    <TableCell align="right" sx={{ color: tx.type === 'debit' ? 'error.main' : 'success.main', fontWeight: 500 }}>
                      {tx.type === 'debit' ? '-' : (isFatura ? '' : '+')}R$ {tx.amount.toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => setTxDialog({ open: true, tx: { ...tx, date: tx.date.split('T')[0] } })}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteTx(tx.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Container>

      <Dialog open={txDialog.open} onClose={() => setTxDialog({ open: false, tx: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{txDialog.tx?.id ? 'Editar' : 'Novo'} Lançamento</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Data" type="date" size="small" InputLabelProps={{ shrink: true }} value={txDialog.tx?.date || ''} onChange={(e) => setTxDialog({ ...txDialog, tx: { ...txDialog.tx, date: e.target.value } })} />
            <TextField label="Descrição" size="small" value={txDialog.tx?.description || ''} onChange={(e) => setTxDialog({ ...txDialog, tx: { ...txDialog.tx, description: e.target.value } })} />
            <TextField label="Estabelecimento" size="small" value={txDialog.tx?.merchant || ''} onChange={(e) => setTxDialog({ ...txDialog, tx: { ...txDialog.tx, merchant: e.target.value } })} />
            <TextField label="Valor" type="number" size="small" value={txDialog.tx?.amount || ''} onChange={(e) => setTxDialog({ ...txDialog, tx: { ...txDialog.tx, amount: parseFloat(e.target.value) } })} />
            <Select size="small" value={txDialog.tx?.type || 'debit'} onChange={(e) => setTxDialog({ ...txDialog, tx: { ...txDialog.tx, type: e.target.value as 'debit' | 'credit' } })}>
              <MenuItem value="debit">Débito</MenuItem>
              <MenuItem value="credit">Crédito</MenuItem>
            </Select>
            <Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Select size="small" displayEmpty fullWidth value={txDialog.tx?.categoryId || ''} onChange={(e) => setTxDialog({ ...txDialog, tx: { ...txDialog.tx, categoryId: e.target.value } })}>
                  <MenuItem value="">Sem categoria</MenuItem>
                  {categories.filter(c => !c.userId).map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LockIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        {c.name}
                      </Box>
                    </MenuItem>
                  ))}
                  {categories.filter(c => c.userId).length > 0 && <MenuItem disabled>—</MenuItem>}
                  {categories.filter(c => c.userId).map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" sx={{ color: 'primary.main' }} />
                        {c.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                <Button size="small" variant="outlined" onClick={() => setCategoryDialog(true)} sx={{ minWidth: 'auto', px: 1 }}>
                  <AddIcon />
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTxDialog({ open: false, tx: null })}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveTx} disabled={saving}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

      <Dialog open={categoryDialog} onClose={() => setCategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nova Categoria</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome"
            fullWidth
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
            required
          />
          <TextField
            label="Cor"
            type="color"
            fullWidth
            value={categoryForm.color}
            onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
            sx={{ mb: 2 }}
            required
          />
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel>Tipo</FormLabel>
            <RadioGroup row value={categoryForm.type} onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value as 'expense' | 'income' })}>
              <FormControlLabel value="expense" control={<Radio />} label="Despesa" />
              <FormControlLabel value="income" control={<Radio />} label="Receita" />
            </RadioGroup>
          </FormControl>
          <TextField
            label="Palavras-chave (uma por linha)"
            fullWidth
            multiline
            rows={4}
            value={categoryForm.keywords}
            onChange={(e) => setCategoryForm({ ...categoryForm, keywords: e.target.value })}
            helperText="Digite uma palavra-chave por linha para auto-classificação"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateCategory} variant="contained">Criar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={linkDialog} onClose={() => setLinkDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Sugestões de Vínculo</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            As transações do documento serão vinculadas como filhas da transação selecionada.
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="right">Valor</TableCell>
                <TableCell>Confiança</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suggestedTransactions.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell>{format(new Date(tx.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell align="right">R$ {tx.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip label={`${tx.confidence}%`} size="small" color={tx.confidence! > 80 ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="contained" onClick={() => handleLinkTransaction(tx.id)} sx={{ mr: 1 }}>Vincular</Button>
                    <Button size="small" onClick={() => handleDismiss(tx.id)}>Descartar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialog(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={manualLinkDialog} onClose={() => setManualLinkDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Vincular Manualmente</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Selecione uma transação para vincular a este documento.
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="right">Valor</TableCell>
                <TableCell align="right">Ação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allTransactions
                .filter(tx => !tx.parentTransactionId && tx.documentId !== id)
                .filter(tx => !searchQuery || tx.description.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell>{format(new Date(tx.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell align="right">R$ {tx.amount.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="outlined" onClick={() => handleLinkTransaction(tx.id)}>Selecionar</Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManualLinkDialog(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
