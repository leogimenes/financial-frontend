import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:3001/api';

export const handlers = [
  // Auth
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as any;
    if (body.email === 'test@test.com' && body.password === 'password') {
      return HttpResponse.json({
        accessToken: 'mock-token',
        user: { id: 'user-1', email: 'test@test.com', role: 'USER' },
      });
    }
    return new HttpResponse(null, { status: 401 });
  }),

  http.post(`${API_URL}/auth/register`, () =>
    HttpResponse.json({
      accessToken: 'mock-token',
      user: { id: 'user-1', email: 'new@test.com', role: 'USER' },
    }),
  ),

  // Documents
  http.get(`${API_URL}/documents`, () =>
    HttpResponse.json([
      {
        id: 'doc-1',
        fileName: 'fatura.pdf',
        fileType: 'pdf',
        fileSize: 1024,
        documentType: 'fatura_cartao',
        status: 'completed',
        bankName: 'Nubank',
        totalAmount: 500,
        createdAt: '2024-06-01T00:00:00.000Z',
        transactions: [],
      },
    ]),
  ),

  http.get(`${API_URL}/documents/:id`, ({ params }) =>
    HttpResponse.json({
      id: params.id,
      fileName: 'fatura.pdf',
      fileType: 'pdf',
      fileSize: 1024,
      documentType: 'fatura_cartao',
      status: 'completed',
      bankName: 'Nubank',
      totalAmount: 500,
      createdAt: '2024-06-01T00:00:00.000Z',
      transactions: [],
    }),
  ),

  http.post(`${API_URL}/documents/upload`, () =>
    HttpResponse.json({ documentId: 'doc-new', fileName: 'upload.pdf', status: 'pending' }),
  ),

  // Transactions
  http.get(`${API_URL}/transactions`, () =>
    HttpResponse.json([
      {
        id: 'tx-1',
        documentId: 'doc-1',
        date: '2024-06-15',
        description: 'Supermercado Extra',
        amount: 150,
        type: 'debit',
        categoryId: 'cat-1',
        category: { id: 'cat-1', name: 'Mercado', type: 'expense', color: '#4CAF50' },
      },
      {
        id: 'tx-2',
        documentId: 'doc-1',
        date: '2024-06-16',
        description: 'Salário',
        amount: 3000,
        type: 'credit',
        category: { id: 'cat-2', name: 'Receita', type: 'income', color: '#388e3c' },
      },
    ]),
  ),

  // Categories
  http.get(`${API_URL}/categories`, () =>
    HttpResponse.json([
      { id: 'cat-1', name: 'Mercado', type: 'expense', color: '#4CAF50', icon: 'shopping_cart', keywords: '["supermercado"]' },
      { id: 'cat-2', name: 'Receita', type: 'income', color: '#388e3c', icon: 'attach_money', keywords: '["salário"]' },
    ]),
  ),

  http.post(`${API_URL}/categories`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({ id: 'cat-new', ...body });
  }),

  http.delete(`${API_URL}/categories/:id`, () =>
    HttpResponse.json({ success: true }),
  ),

  http.patch(`${API_URL}/documents/:id`, () =>
    HttpResponse.json({ id: 'doc-1', bankName: 'Updated', status: 'completed' }),
  ),

  http.delete(`${API_URL}/documents/:id`, () =>
    HttpResponse.json({ success: true }),
  ),

  // Transactions CRUD
  http.get(`${API_URL}/transactions/:id`, ({ params }) =>
    HttpResponse.json({
      id: params.id,
      documentId: 'doc-1',
      date: '2024-06-15',
      description: 'Supermercado Extra',
      amount: 150,
      type: 'debit',
    }),
  ),

  http.post(`${API_URL}/transactions`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({ id: 'tx-new', ...body });
  }),

  http.patch(`${API_URL}/transactions/:id`, async ({ request, params }) => {
    const body = await request.json() as any;
    return HttpResponse.json({ id: params.id, ...body });
  }),

  http.delete(`${API_URL}/transactions/:id`, () =>
    HttpResponse.json({ success: true }),
  ),

  // Categories update
  http.patch(`${API_URL}/categories/:id`, async ({ request, params }) => {
    const body = await request.json() as any;
    return HttpResponse.json({ id: params.id, ...body });
  }),

  // Document-Transaction linking
  http.get(`${API_URL}/documents/:id/suggested-transactions`, () =>
    HttpResponse.json([]),
  ),

  http.post(`${API_URL}/documents/:id/link-transaction`, () =>
    HttpResponse.json({ success: true }),
  ),

  http.post(`${API_URL}/documents/:id/dismiss-suggestion`, () =>
    HttpResponse.json({ success: true }),
  ),

  // Events
  http.post(`${API_URL}/events`, () =>
    HttpResponse.json({ ok: true }),
  ),
];
