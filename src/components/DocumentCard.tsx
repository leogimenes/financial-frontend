'use client';
import { useRouter } from 'next/navigation';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Document } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

interface DocumentCardProps {
  document: Document;
  onDelete?: (id: string) => void;
}

export default function DocumentCard({ document: doc, onDelete }: DocumentCardProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isFatura = doc.documentType === 'fatura_cartao';
  const transactionCount = doc.transactions?.length || 0;
  const isCompleted = doc.status === 'completed';

  const handleCardClick = () => {
    if (isCompleted) router.push(`/documents/${doc.id}`);
  };

  return (
    <Card 
      onClick={handleCardClick}
      sx={{ 
        '&:hover': { boxShadow: 4, transform: 'translateY(-4px)' }, 
        transition: 'all 0.3s', 
        cursor: isCompleted ? 'pointer' : 'default',
        opacity: isCompleted ? 1 : 0.7,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Chip
            icon={isFatura ? <CreditCardIcon /> : <AccountBalanceIcon />}
            label={isFatura ? 'Fatura' : 'Extrato'}
            size="small"
            sx={{ bgcolor: isFatura ? '#e3f2fd' : '#f3e5f5', color: isFatura ? '#1976d2' : '#7b1fa2' }}
          />
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}>
            <MoreVertIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            {isCompleted && (
              <MenuItem onClick={(e) => { e.stopPropagation(); setAnchorEl(null); router.push(`/documents/${doc.id}`); }}>
                <EditIcon sx={{ mr: 1, fontSize: 18 }} /> Editar
              </MenuItem>
            )}
            <MenuItem onClick={(e) => { e.stopPropagation(); setAnchorEl(null); onDelete?.(doc.id); }} sx={{ color: 'error.main' }}>
              <DeleteIcon sx={{ mr: 1, fontSize: 18 }} /> Excluir
            </MenuItem>
          </Menu>
        </Box>

        <Typography variant="h6" gutterBottom>
          {doc.bankName || doc.fileName}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {isFatura 
            ? `Cartão ${doc.cardNumberMasked || '****'} • ${doc.closingDate ? format(new Date(doc.closingDate), 'MMM/yyyy', { locale: ptBR }) : '-'}`
            : `Ag. ${doc.accountAgency || '-'} | CC ${doc.accountNumber || '-'}`
          }
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {isFatura ? 'Valor Total' : 'Saldo Inicial'}
            </Typography>
            <Typography variant="body1" fontWeight={500} color={isFatura ? 'error' : 'inherit'}>
              R$ {((isFatura ? doc.totalAmount : doc.initialBalance) || 0).toFixed(2)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {isFatura ? 'Vencimento' : 'Saldo Final'}
            </Typography>
            <Typography variant="body1" fontWeight={500} color={!isFatura && (doc.finalBalance || 0) > 0 ? 'success.main' : 'inherit'}>
              {isFatura 
                ? (doc.dueDate ? format(new Date(doc.dueDate), 'dd/MM/yyyy') : '-')
                : `R$ ${(doc.finalBalance || 0).toFixed(2)}`
              }
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 2, borderTop: '1px solid #f5f5f5' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontSize: 12 }}>
            <ScheduleIcon sx={{ fontSize: 14 }} />
            {format(new Date(doc.createdAt), 'dd/MM/yyyy')}
          </Box>
          <Chip label={`${transactionCount} lançamentos`} size="small" sx={{ bgcolor: '#e8eaf6', color: '#5e35b1' }} />
        </Box>
      </CardContent>
    </Card>
  );
}
