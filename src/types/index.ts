export interface Category {
  id: string;
  userId?: string | null;
  name: string;
  type: 'expense' | 'income';
  color?: string;
  icon?: string;
  keywords?: string;
}

export interface Transaction {
  id: string;
  documentId: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  categoryId?: string;
  category?: Category;
  merchant?: string;
  currentInstallment?: number;
  totalInstallments?: number;
  balanceAfterTransaction?: number;
  parentTransactionId?: string;
  childTransactions?: Transaction[];
  confidence?: number;
}

export interface Document {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType: 'fatura_cartao' | 'extrato_bancario' | 'nota_fiscal';
  status: 'pending' | 'processing' | 'completed' | 'error';
  statusMessage?: string;
  bankName?: string;
  cardNumberMasked?: string;
  accountAgency?: string;
  accountNumber?: string;
  closingDate?: string;
  dueDate?: string;
  periodStart?: string;
  periodEnd?: string;
  totalAmount?: number;
  creditLimit?: number;
  initialBalance?: number;
  finalBalance?: number;
  createdAt: string;
  processedAt?: string;
  transactions?: Transaction[];
  linkedTransactionId?: string;
  dismissedSuggestions?: string;
}

export interface UploadResponse {
  documentId: string;
  fileName: string;
  status: string;
}
