import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '@/test/mocks/server';

vi.mock('@/lib/wide-event-logger', () => ({
  wideEventLogger: {
    getTraceparent: vi.fn().mockReturnValue('00-traceid-spanid-01'),
    log: vi.fn(),
  },
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('API service', () => {
  it('should export all api functions', async () => {
    const api = await import('./api');
    expect(api.login).toBeDefined();
    expect(api.register).toBeDefined();
    expect(api.uploadDocument).toBeDefined();
    expect(api.getDocuments).toBeDefined();
    expect(api.getDocument).toBeDefined();
    expect(api.updateDocument).toBeDefined();
    expect(api.deleteDocument).toBeDefined();
    expect(api.getTransactions).toBeDefined();
    expect(api.getTransaction).toBeDefined();
    expect(api.updateTransaction).toBeDefined();
    expect(api.createTransaction).toBeDefined();
    expect(api.deleteTransaction).toBeDefined();
    expect(api.getCategories).toBeDefined();
    expect(api.createCategory).toBeDefined();
    expect(api.updateCategory).toBeDefined();
    expect(api.deleteCategory).toBeDefined();
    expect(api.getSuggestedTransactions).toBeDefined();
    expect(api.linkDocumentTransaction).toBeDefined();
    expect(api.dismissSuggestion).toBeDefined();
  });

  it('should login successfully', async () => {
    const { login } = await import('./api');
    const res = await login('test@test.com', 'password');
    expect(res.data.accessToken).toBe('mock-token');
  });

  it('should register successfully', async () => {
    const { register } = await import('./api');
    const res = await register('new@test.com', 'password', 'Test User');
    expect(res.data.accessToken).toBe('mock-token');
  });

  it('should get documents', async () => {
    const { getDocuments } = await import('./api');
    const res = await getDocuments();
    expect(Array.isArray(res.data)).toBe(true);
  });

  it('should get a single document', async () => {
    const { getDocument } = await import('./api');
    const res = await getDocument('doc-1');
    expect(res.data.id).toBe('doc-1');
  });

  it('should get transactions', async () => {
    const { getTransactions } = await import('./api');
    const res = await getTransactions();
    expect(Array.isArray(res.data)).toBe(true);
  });

  it('should get categories', async () => {
    const { getCategories } = await import('./api');
    const res = await getCategories();
    expect(Array.isArray(res.data)).toBe(true);
  });

  it('should create a category', async () => {
    const { createCategory } = await import('./api');
    const res = await createCategory({ name: 'Test', type: 'expense', color: '#000', keywords: [] });
    expect(res.data).toBeDefined();
  });

  it('should delete a category', async () => {
    const { deleteCategory } = await import('./api');
    const res = await deleteCategory('cat-1');
    expect(res.status).toBe(200);
  });

  it('should get suggested transactions', async () => {
    const { getSuggestedTransactions } = await import('./api');
    const res = await getSuggestedTransactions('doc-1');
    expect(Array.isArray(res.data)).toBe(true);
  });

  it('should update a document', async () => {
    const { updateDocument } = await import('./api');
    const res = await updateDocument('doc-1', { bankName: 'Updated' });
    expect(res.data).toBeDefined();
  });

  it('should delete a document', async () => {
    const { deleteDocument } = await import('./api');
    const res = await deleteDocument('doc-1');
    expect(res.status).toBe(200);
  });

  it('should get a single transaction', async () => {
    const { getTransaction } = await import('./api');
    const res = await getTransaction('tx-1');
    expect(res.data).toBeDefined();
  });

  it('should update a transaction', async () => {
    const { updateTransaction } = await import('./api');
    const res = await updateTransaction('tx-1', { description: 'Updated' });
    expect(res.data).toBeDefined();
  });

  it('should create a transaction', async () => {
    const { createTransaction } = await import('./api');
    const res = await createTransaction({
      documentId: 'doc-1',
      date: '2024-06-15',
      description: 'Test',
      amount: 100,
      type: 'debit',
    });
    expect(res.data).toBeDefined();
  });

  it('should delete a transaction', async () => {
    const { deleteTransaction } = await import('./api');
    const res = await deleteTransaction('tx-1');
    expect(res.status).toBe(200);
  });

  it('should update a category', async () => {
    const { updateCategory } = await import('./api');
    const res = await updateCategory('cat-1', { name: 'Updated' });
    expect(res.data).toBeDefined();
  });

  it('should link document transaction', async () => {
    const { linkDocumentTransaction } = await import('./api');
    const res = await linkDocumentTransaction('doc-1', 'tx-1');
    expect(res.data).toBeDefined();
  });

  it('should dismiss suggestion', async () => {
    const { dismissSuggestion } = await import('./api');
    const res = await dismissSuggestion('doc-1', 'tx-1');
    expect(res.data).toBeDefined();
  });

  it('should upload a document', async () => {
    const { uploadDocument } = await import('./api');
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const res = await uploadDocument(file);
    expect(res.data.documentId).toBeDefined();
  });
});
