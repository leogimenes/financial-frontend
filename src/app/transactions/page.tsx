'use client';
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import LinkIcon from '@mui/icons-material/Link';
import CustomAppBar from '@/components/AppBar';
import CategoryChip from '@/components/CategoryChip';
import { getTransactions, getCategories } from '@/services/api';
import { Transaction, Category } from '@/types';
import { format } from 'date-fns';
import { useRequireAuth } from '@/contexts/AuthContext';
import * as XLSX from 'xlsx';

export default function LancamentosPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ categoryId: '', type: '', startDate: '', endDate: '' });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [txRes, catRes] = await Promise.all([
        getTransactions(Object.fromEntries(Object.entries(filters).filter(([, v]) => v))),
        getCategories(),
      ]);
      setTransactions(txRes.data);
      setCategories(catRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const exportToExcel = () => {
    const data = transactions.map(t => ({
      'Data': format(new Date(t.date), 'dd/MM/yyyy'),
      'Descrição': t.description,
      'Valor': t.amount,
      'Tipo': t.type === 'debit' ? 'Débito' : 'Crédito',
      'Categoria': t.category?.name || 'Sem categoria',
      'Comerciante': t.merchant || '',
      'Parcela Atual': t.currentInstallment || '',
      'Total Parcelas': t.totalInstallments || '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lançamentos');
    XLSX.writeFile(wb, `lancamentos_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (authLoading || !user) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><CircularProgress /></Box>;
  }

  // Exclude parent transactions with children from totals
  const transactionsForSum = transactions.filter(t => !t.childTransactions || t.childTransactions.length === 0);
  const totalDebitos = transactionsForSum.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
  const totalCreditos = transactionsForSum.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  const saldo = totalCreditos - totalDebitos;
  const media = transactionsForSum.length ? totalDebitos / transactionsForSum.filter(t => t.type === 'debit').length : 0;

  return (
    <>
      <CustomAppBar />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>Lançamentos</Typography>
            <Typography variant="body2" color="text.secondary">{transactions.length} transações encontradas</Typography>
          </Box>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={exportToExcel} sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}>
            Exportar Excel
          </Button>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 3 }}>
          <Card sx={{ borderLeft: '4px solid #d32f2f' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 500 }}>Total de Débitos</Typography>
              <Typography variant="h4" fontWeight={300} color="error" sx={{ my: 1 }}>R$ {totalDebitos.toFixed(2)}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ borderLeft: '4px solid #388e3c' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 500 }}>Total de Créditos</Typography>
              <Typography variant="h4" fontWeight={300} color="success.main" sx={{ my: 1 }}>R$ {totalCreditos.toFixed(2)}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ borderLeft: `4px solid ${saldo >= 0 ? '#388e3c' : '#d32f2f'}` }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 500 }}>Saldo do Período</Typography>
              <Typography variant="h4" fontWeight={300} color={saldo >= 0 ? 'success.main' : 'error'} sx={{ my: 1 }}>
                {saldo >= 0 ? '' : '- '}R$ {Math.abs(saldo).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ borderLeft: '4px solid #1976d2' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 500 }}>Média por Débito</Typography>
              <Typography variant="h4" fontWeight={300} sx={{ my: 1 }}>R$ {media.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <Box sx={{ minWidth: 180 }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 500 }}>Categoria</Typography>
                <Select fullWidth size="small" value={filters.categoryId} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })} sx={{ mt: 0.5 }}>
                  <MenuItem value="">Todas</MenuItem>
                  {categories.filter(c => !c.userId).map(c => (
                    <MenuItem key={c.id} value={c.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LockIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        {c.name}
                      </Box>
                    </MenuItem>
                  ))}
                  {categories.filter(c => c.userId).length > 0 && <MenuItem disabled>—</MenuItem>}
                  {categories.filter(c => c.userId).map(c => (
                    <MenuItem key={c.id} value={c.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" sx={{ color: 'primary.main' }} />
                        {c.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </Box>
              <Box sx={{ minWidth: 150 }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 500 }}>Tipo</Typography>
                <Select fullWidth size="small" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} sx={{ mt: 0.5 }}>
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="debit">Débito</MenuItem>
                  <MenuItem value="credit">Crédito</MenuItem>
                </Select>
              </Box>
              <Box sx={{ minWidth: 160 }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 500 }}>Data Início</Typography>
                <TextField type="date" fullWidth size="small" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} sx={{ mt: 0.5 }} />
              </Box>
              <Box sx={{ minWidth: 160 }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 500 }}>Data Fim</Typography>
                <TextField type="date" fullWidth size="small" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} sx={{ mt: 0.5 }} />
              </Box>
              <Button variant="contained" startIcon={<SearchIcon />} onClick={fetchData} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                Filtrar
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
          ) : transactions.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 8, textAlign: 'center' }}>Nenhuma transação encontrada</Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#fafafa' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500, color: 'text.secondary', textTransform: 'uppercase', fontSize: 13 }}>Data</TableCell>
                    <TableCell sx={{ fontWeight: 500, color: 'text.secondary', textTransform: 'uppercase', fontSize: 13 }}>Descrição</TableCell>
                    <TableCell sx={{ fontWeight: 500, color: 'text.secondary', textTransform: 'uppercase', fontSize: 13 }}>Parcelas</TableCell>
                    <TableCell sx={{ fontWeight: 500, color: 'text.secondary', textTransform: 'uppercase', fontSize: 13 }}>Categoria</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 500, color: 'text.secondary', textTransform: 'uppercase', fontSize: 13 }}>Valor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.filter(tx => !tx.parentTransactionId).map((tx) => {
                    const isLastInstallment = tx.currentInstallment && tx.totalInstallments && tx.currentInstallment === tx.totalInstallments;
                    const hasChildren = tx.childTransactions && tx.childTransactions.length > 0;
                    const isExpanded = expandedRows.has(tx.id);
                    
                    return (
                      <React.Fragment key={tx.id}>
                        <TableRow 
                          sx={{ 
                            '&:hover': { bgcolor: '#fafafa' },
                            bgcolor: isLastInstallment ? '#e8f5e9' : 'transparent'
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {hasChildren && (
                                <IconButton size="small" onClick={() => toggleRow(tx.id)}>
                                  {isExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                                </IconButton>
                              )}
                              {format(new Date(tx.date), 'dd/MM/yyyy')}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: hasChildren ? 600 : 400 }}>
                                  {tx.description}
                                </Typography>
                                {tx.merchant && (
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    {tx.merchant}
                                  </Typography>
                                )}
                              </Box>
                              {hasChildren && <Chip label={`${tx.childTransactions!.length} itens`} size="small" icon={<LinkIcon />} color="primary" variant="outlined" />}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {tx.currentInstallment && tx.totalInstallments ? (
                              <Chip 
                                label={`${tx.currentInstallment}/${tx.totalInstallments}`}
                                size="small"
                                color={isLastInstallment ? 'success' : 'default'}
                                sx={{ fontWeight: 500 }}
                              />
                            ) : (
                              <Typography variant="caption" color="text.secondary">—</Typography>
                            )}
                          </TableCell>
                          <TableCell><CategoryChip category={hasChildren ? undefined : tx.category} /></TableCell>
                          <TableCell align="right">
                            {hasChildren ? (
                              <Box>
                                <Typography fontSize={13} color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                  Ver detalhes
                                </Typography>
                              </Box>
                            ) : (
                              <Typography fontWeight={500} color={tx.type === 'debit' ? 'error' : 'success.main'}>
                                {tx.type === 'debit' ? '- ' : '+ '}R$ {tx.amount.toFixed(2)}
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                        
                        {hasChildren && isExpanded && tx.childTransactions!.map((child) => (
                          <TableRow key={child.id} sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell sx={{ pl: 8 }}>{format(new Date(child.date), 'dd/MM/yyyy')}</TableCell>
                            <TableCell>
                              <Typography variant="body2" fontSize={13}>{child.description}</Typography>
                            </TableCell>
                            <TableCell>
                              {child.currentInstallment && child.totalInstallments ? (
                                <Chip label={`${child.currentInstallment}/${child.totalInstallments}`} size="small" />
                              ) : (
                                <Typography variant="caption" color="text.secondary">—</Typography>
                              )}
                            </TableCell>
                            <TableCell><CategoryChip category={child.category} /></TableCell>
                            <TableCell align="right">
                              <Typography fontSize={13} color={child.type === 'debit' ? 'error' : 'success.main'}>
                                {child.type === 'debit' ? '- ' : '+ '}R$ {child.amount.toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    );
                  })}
                  <TableRow sx={{ bgcolor: '#f5f5f5', borderTop: '2px solid #e0e0e0' }}>
                    <TableCell colSpan={4} sx={{ fontWeight: 600, fontSize: 15 }}>Total</TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600} fontSize={15} color={saldo >= 0 ? 'success.main' : 'error'}>
                        R$ {Math.abs(saldo).toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Débitos: R$ {totalDebitos.toFixed(2)} | Créditos: R$ {totalCreditos.toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Container>
    </>
  );
}
