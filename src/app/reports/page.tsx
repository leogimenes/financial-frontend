'use client';
import { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import CustomAppBar from '@/components/AppBar';
import { getTransactions, getCategories } from '@/services/api';
import { Transaction, Category } from '@/types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useRequireAuth } from '@/contexts/AuthContext';
import * as XLSX from 'xlsx';

export default function RelatoriosPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [txRes, catRes] = await Promise.all([getTransactions(), getCategories()]);
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
      'Data': new Date(t.date).toLocaleDateString('pt-BR'),
      'Descrição': t.description,
      'Valor': t.amount,
      'Tipo': t.type === 'debit' ? 'Débito' : 'Crédito',
      'Categoria': t.category?.name || 'Sem categoria',
      'Comerciante': t.merchant || '',
      'Parcela Atual': t.currentInstallment || '',
      'Total Parcelas': t.totalInstallments || '',
      'Saldo Após': t.balanceAfterTransaction || '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transações');
    XLSX.writeFile(wb, `transacoes_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const stats = useMemo(() => {
    const debits = transactions.filter(t => t.type === 'debit');
    const credits = transactions.filter(t => t.type === 'credit');
    const totalDebitos = debits.reduce((sum, t) => t.childTransactions && t.childTransactions.length > 0 ? sum : sum + t.amount , 0);
    const totalCreditos = credits.reduce((sum, t) => sum + t.amount, 0);
    const saldo = totalCreditos - totalDebitos;
    const ticketMedio = debits.length ? totalDebitos / debits.length : 0;

    const byCategory = categories.map(cat => {
      const catTx = transactions.filter(t => t.categoryId === cat.id && t.type === 'debit');
      return { name: cat.name, value: catTx.reduce((sum, t) => t.childTransactions && t.childTransactions.length? sum : sum + t.amount, 0), color: cat.color || '#757575' };
    }).filter(c => c.value > 0).sort((a, b) => b.value - a.value);

    const topCategory = byCategory[0];

    return { totalDebitos, totalCreditos, saldo, ticketMedio, byCategory, topCategory };
  }, [transactions, categories]);

  if (authLoading || !user) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><CircularProgress /></Box>;
  }

  if (loading) {
    return (
      <>
        <CustomAppBar />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  return (
    <>
      <CustomAppBar />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">Dashboard Financeiro</Typography>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Atualizar</Button>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 3, mb: 4 }}>
          {[
            { icon: TrendingDownIcon, label: 'Total de Despesas', value: `R$ ${stats.totalDebitos.toFixed(2)}`, color: '#d32f2f' },
            { icon: TrendingUpIcon, label: 'Total de Receitas', value: `R$ ${stats.totalCreditos.toFixed(2)}`, color: '#388e3c' },
            { icon: AccountBalanceIcon, label: 'Saldo', value: `${stats.saldo >= 0 ? '' : '- '}R$ ${Math.abs(stats.saldo).toFixed(2)}`, color: stats.saldo >= 0 ? '#388e3c' : '#d32f2f' },
            { icon: ShowChartIcon, label: 'Ticket Médio', value: `R$ ${stats.ticketMedio.toFixed(2)}`, color: '#1976d2' },
            { icon: ShoppingCartIcon, label: 'Maior Categoria', value: stats.topCategory?.name || '-', color: '#667eea' },
          ].map((kpi, index) => (
            <Card key={index} sx={{ borderTop: '4px solid', borderColor: 'primary.main' }}>
              <CardContent>
                <Box sx={{ width: 48, height: 48, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <kpi.icon sx={{ color: 'white' }} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 500 }}>{kpi.label}</Typography>
                <Typography variant="h5" fontWeight={300} sx={{ my: 1, color: kpi.color }}>{kpi.value}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: 3, mb: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Despesas por Categoria</Typography>
                <IconButton size="small"><MoreVertIcon /></IconButton>
              </Box>
              {stats.byCategory.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 8, textAlign: 'center' }}>Sem dados</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie 
                      data={stats.byCategory} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={100} 
                      label={(entry) => `R$ ${entry.value.toFixed(2)}`}
                    >
                      {stats.byCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(value) => typeof value === 'number' ? `R$ ${value.toFixed(2)}` : 'N/A'} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Top 5 Despesas</Typography>
                <IconButton size="small"><MoreVertIcon /></IconButton>
              </Box>
              {stats.byCategory.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 8, textAlign: 'center' }}>Sem dados</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.byCategory.slice(0, 5)} layout="vertical">
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => typeof value === 'number' ? `R$ ${value.toFixed(2)}` : 'N/A'} />
                    <Bar dataKey="value" fill="#667eea" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>Análise Detalhada por Categoria</Typography>
            {stats.byCategory.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>Sem dados para exibir</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {stats.byCategory.map((cat, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${cat.color}20`, color: cat.color, flexShrink: 0, fontWeight: 600 }}>
                      {cat.name.substring(0, 1)}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={500} gutterBottom>{cat.name}</Typography>
                      <LinearProgress variant="determinate" value={stats.totalDebitos ? (cat.value / stats.totalDebitos) * 100 : 0} sx={{ height: 8, borderRadius: 1, '& .MuiLinearProgress-bar': { bgcolor: cat.color } }} />
                    </Box>
                    <Box sx={{ textAlign: 'right', minWidth: 120 }}>
                      <Typography fontWeight={500} color="error">R$ {cat.value.toFixed(2)}</Typography>
                      <Typography variant="caption" color="text.secondary">{stats.totalDebitos ? ((cat.value / stats.totalDebitos) * 100).toFixed(1) : 0}%</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={exportToExcel} sx={{ p: 2, bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}>
            Exportar Excel Completo
          </Button>
          <Button variant="outlined" startIcon={<PictureAsPdfIcon />} sx={{ p: 2 }}>Gerar PDF do Relatório</Button>
          <Button variant="outlined" startIcon={<InsertChartIcon />} sx={{ p: 2 }}>Exportar Gráficos (PNG)</Button>
        </Box>
      </Container>
    </>
  );
}
