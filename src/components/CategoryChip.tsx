'use client';
import Chip from '@mui/material/Chip';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import MedicationIcon from '@mui/icons-material/Medication';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import HomeIcon from '@mui/icons-material/Home';
import CelebrationIcon from '@mui/icons-material/Celebration';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Category } from '@/types';

interface CategoryChipProps {
  category?: Category | null;
  name?: string;
}

const iconMap: Record<string, React.JSX.Element> = {
  'shopping_cart': <ShoppingCartIcon />,
  'restaurant': <FastfoodIcon />,
  'directions_car': <LocalGasStationIcon />,
  'local_hospital': <MedicationIcon />,
  'subscriptions': <SubscriptionsIcon />,
  'home': <HomeIcon />,
  'celebration': <CelebrationIcon />,
  'attach_money': <AttachMoneyIcon />,
  'more_horiz': <MoreHorizIcon />,
};

const defaultConfig: Record<string, { icon: React.JSX.Element; color: string; bgcolor: string }> = {
  'Mercado': { icon: <ShoppingCartIcon />, color: '#2e7d32', bgcolor: '#e8f5e9' },
  'Alimentação': { icon: <FastfoodIcon />, color: '#ef6c00', bgcolor: '#fff3e0' },
  'Transporte': { icon: <LocalGasStationIcon />, color: '#1976d2', bgcolor: '#e3f2fd' },
  'Saúde': { icon: <MedicationIcon />, color: '#c62828', bgcolor: '#ffebee' },
  'Assinatura': { icon: <SubscriptionsIcon />, color: '#7b1fa2', bgcolor: '#f3e5f5' },
  'Essencial': { icon: <HomeIcon />, color: '#00695c', bgcolor: '#e0f2f1' },
  'Lazer': { icon: <CelebrationIcon />, color: '#c2185b', bgcolor: '#fce4ec' },
  'Receita': { icon: <AttachMoneyIcon />, color: '#388e3c', bgcolor: '#e8f5e9' },
  'Outros': { icon: <MoreHorizIcon />, color: '#757575', bgcolor: '#f5f5f5' },
};

export default function CategoryChip({ category, name }: CategoryChipProps) {
  const categoryName = category?.name || name || 'Outros';
  const fallback = defaultConfig[categoryName] || defaultConfig['Outros'];
  
  const icon = category?.icon ? (iconMap[category.icon] || fallback.icon) : fallback.icon;
  const color = category?.color || fallback.color;
  const bgcolor = `${color}15`;

  return (
    <Chip
      icon={icon}
      label={categoryName}
      size="small"
      sx={{ bgcolor, color, fontWeight: 500, '& .MuiChip-icon': { fontSize: 14, color } }}
    />
  );
}
