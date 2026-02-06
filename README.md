# Financial Analysis Frontend

Next.js 16 frontend for financial document analysis with Material-UI.

> **Part of the Financial Analysis System**  
> Backend repository: [financial-backend](../financial-backend)

## Features

- **Authentication**: JWT-based login/register
- **Document Upload**: Drag & drop CSV/PDF/images
- **Transaction Management**: View, edit, filter transactions
- **Categories**: Custom categories with auto-classification
- **Reports**: Dashboard with charts and KPIs
- **Document Linking**: Connect receipts to credit card transactions
- **Observability**: Wide event logging with fallback chain

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript 5
- **UI**: Material-UI v7 + Emotion
- **Charts**: Recharts v3
- **HTTP**: Axios with auth interceptors
- **State**: React Context (AuthContext)
- **Observability**: OpenTelemetry + ClickHouse fallback

## Setup

### Prerequisites

- Node.js 18+
- pnpm
- Running backend (see [financial-backend](../financial-backend))

### Installation

```bash
pnpm install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

### Start Development Server

```bash
pnpm dev
```

Frontend runs on `http://localhost:3000`

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   ├── upload/             # File upload interface
│   ├── documentos/         # Document listing & edit
│   ├── lancamentos/        # Transaction table
│   └── relatorios/         # Reports dashboard
├── components/             # Reusable React components
├── contexts/               # React contexts (AuthContext)
├── hooks/                  # Custom hooks (useWideEvent)
├── lib/                    # Utilities (PII sanitizer, telemetry)
├── services/               # API client (axios)
└── types/                  # TypeScript interfaces
```

## API Integration

### Using Backend Types

The frontend uses TypeScript types generated from the backend's OpenAPI spec.

**Update types after backend changes:**

```bash
# 1. In backend repo, generate types
cd ../financial-backend
pnpm start:dev              # Generates openapi.json
pnpm openapi:generate       # Creates openapi-types.ts

# 2. Copy to frontend
cp openapi-types.ts ../financial-frontend/src/types/api.ts
```

### API Client

Located in `src/services/api.ts`:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Auto-adds JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

## Pages

### Public Routes
- `/login` - User login
- `/register` - User registration

### Protected Routes
- `/upload` - Upload financial documents
- `/documentos` - List and manage documents
- `/documentos/[id]` - Edit document details
- `/lancamentos` - Transaction table with filters
- `/relatorios` - Dashboard with charts and KPIs

## Components

### Key Components
- `DocumentUpload` - Drag & drop file upload
- `TransactionTable` - Filterable transaction list
- `CategoryManager` - Create/edit categories
- `LinkDocumentDialog` - Link documents to transactions
- `ReportsCharts` - Recharts visualizations

### Design System
- **Colors**: Primary gradient `#667eea → #764ba2`
- **Typography**: Roboto font family
- **Spacing**: 8px grid system
- **Icons**: Material Icons

## Authentication

Uses JWT tokens stored in localStorage:

```typescript
// Login
const { token, user } = await api.post('/auth/login', { email, password });
localStorage.setItem('token', token);

// Logout
localStorage.removeItem('token');
```

## Observability

### Wide Event Logging

Every user action generates a correlated event:

```typescript
import { useWideEvent } from '@/hooks/useWideEvent';

const { log, logClick, flush } = useWideEvent('document_upload');

log('file_size', file.size);
logClick('upload_button');
flush(); // Send to backend
```

### Fallback Chain

Events never lost:
1. **Backend API** (`POST /api/events`) - Primary
2. **Direct ClickHouse** - If backend down
3. **LocalStorage queue** - If ClickHouse down, retry later
4. **console.warn** - Last resort

## Building for Production

```bash
# Build
pnpm build

# Start production server
pnpm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001/api` |
| `NEXT_PUBLIC_OTLP_ENDPOINT` | OpenTelemetry endpoint | `http://localhost:4318/v1/traces` |

## Development Tips

### Hot Reload
Next.js automatically reloads on file changes.

### Type Safety
Import types from `src/types/api.ts` (generated from backend OpenAPI spec).

### Debugging
- React DevTools for component inspection
- Network tab for API calls
- Console for wide events

## License

UNLICENSED
