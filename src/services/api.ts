import axios from 'axios';
import { Document, Transaction, Category, UploadResponse } from '@/types';
import { wideEventLogger } from '@/lib/wide-event-logger';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
});

// Add auth token and trace context
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  // Use wide event logger trace ID
  if (wideEventLogger) {
    config.headers['traceparent'] = wideEventLogger.getTraceparent();
  } else {
    const traceId = crypto.randomUUID().replace(/-/g, '').slice(0, 32);
    const spanId = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    config.headers['traceparent'] = `00-${traceId}-${spanId}-01`;
  }
  
  // Log API call start
  const startTime = Date.now();
  (config as unknown as { metadata: { startTime: number } }).metadata = { startTime };
  
  return config;
});

// Handle responses and errors
api.interceptors.response.use(
  (response) => {
    try {
      const startTime = (response.config as unknown as { metadata: { startTime: number } }).metadata?.startTime;
      if (startTime && wideEventLogger) {
        wideEventLogger.log(`api.${response.config.method}.${response.config.url}`, Date.now() - startTime);
      }
    } catch {}
    return response;
  },
  (error) => {
    try {
      if (wideEventLogger) {
        wideEventLogger.log('api.error.url', error.config?.url);
        wideEventLogger.log('api.error.status', error.response?.status);
        wideEventLogger.log('api.error.message', error.message);
      }
    } catch {}
    
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (email: string, password: string) =>
  api.post<{ accessToken: string; user: { id: string; email: string; role: string } }>('/auth/login', { email, password });

export const register = (email: string, password: string, name?: string) =>
  api.post<{ accessToken: string; user: { id: string; email: string; role: string } }>('/auth/register', { email, password, name });

export const uploadDocument = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post<UploadResponse>('/documents/upload', formData);
};

export const getDocuments = (includeTransactions = false) =>
  api.get<Document[]>('/documents', { params: { includeTransactions } });

export const getDocument = (id: string) =>
  api.get<Document>(`/documents/${id}`);

export const updateDocument = (id: string, data: Partial<Document>) =>
  api.patch<Document>(`/documents/${id}`, data);

export const deleteDocument = (id: string) =>
  api.delete(`/documents/${id}`);

export const getTransactions = (filters?: {
  documentId?: string;
  categoryId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}) => api.get<Transaction[]>('/transactions', { params: filters });

export const getTransaction = (id: string) =>
  api.get<Transaction>(`/transactions/${id}`);

export const updateTransaction = (id: string, data: Partial<Transaction>) =>
  api.patch<Transaction>(`/transactions/${id}`, data);

export const createTransaction = (data: {
  documentId: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  categoryId?: string;
  merchant?: string;
}) => api.post<Transaction>('/transactions', data);

export const deleteTransaction = (id: string) =>
  api.delete(`/transactions/${id}`);

export const getCategories = () =>
  api.get<Category[]>('/categories');

export const createCategory = (data: {
  name: string;
  type: 'expense' | 'income';
  color: string;
  keywords: string[];
  icon?: string;
}) => api.post<Category>('/categories', data);

export const updateCategory = (id: string, data: {
  name?: string;
  type?: 'expense' | 'income';
  color?: string;
  keywords?: string[];
  icon?: string;
}) => api.patch<Category>(`/categories/${id}`, data);

export const deleteCategory = (id: string) =>
  api.delete(`/categories/${id}`);

// Document-Transaction linking
export const getSuggestedTransactions = (documentId: string) =>
  api.get<Transaction[]>(`/documents/${documentId}/suggested-transactions`);

export const linkDocumentTransaction = (documentId: string, transactionId: string) =>
  api.post(`/documents/${documentId}/link-transaction`, { transactionId });

export const dismissSuggestion = (documentId: string, transactionId: string) =>
  api.post(`/documents/${documentId}/dismiss-suggestion`, { transactionId });

export default api;
