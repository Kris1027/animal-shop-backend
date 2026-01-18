# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Compile TypeScript to dist/
npm run start        # Run production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format with Prettier
npm run check        # Run prettier + eslint + tsc (CI check)
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

Run specific tests:
```bash
npx vitest run tests/unit              # Unit tests only
npx vitest run tests/integration       # Integration tests only
npx vitest run tests/integration/auth.test.ts  # Single file
```

## Architecture

Express 5 REST API with TypeScript, using in-memory data storage.

### Project Structure

```
src/                    # Application source code
├── routes/             # Express routers with middleware
├── controllers/        # HTTP request/response handling
├── services/           # Business logic
├── data/               # In-memory arrays
├── schemas/            # Zod schemas for validation
├── middleware/         # Auth, validation, error handling
└── utils/              # Helpers (errors, success responses)

tests/                  # All test files (separate from src)
├── helpers.ts          # Test utilities (getAdminToken, getUserToken)
├── unit/               # Unit tests
│   └── services/       # Service layer tests
└── integration/        # API integration tests
```

### Layer Structure

Each feature follows: `routes → controllers → services → data`

### Environment Variables

Required in `.env`:
- `JWT_SECRET` - Min 32 characters
- `JWT_EXPIRES_IN` - Token expiry (default: 15m)
- `PORT` - Server port (default: 3000)
- `LOG_LEVEL` - Pino log level (default: info)

---

## Coding Rules & Patterns

### Route Patterns

**Middleware Order:** Always apply middleware in this order:
```typescript
router.get('/', authenticate, readLimiter, validateQuery(schema), controller.method);
router.post('/', authenticate, authorize('admin'), strictLimiter, validate(schema), controller.method);
```

1. Authentication (`authenticate`, `optionalAuth`, `rejectAuthenticated`)
2. Authorization (`authorize('admin')`)
3. Rate limiting (`strictLimiter` for writes, `readLimiter` for authenticated reads)
4. Validation (`validate(schema)` for body, `validateQuery(schema)` for query params)
5. Controller handler

**Rate Limiting:**
- `strictLimiter` (20 req/15min): All write operations (POST, PUT, PATCH, DELETE)
- `readLimiter` (100 req/15min): Authenticated GET endpoints (user-scoped resources)
- Public GET endpoints (products, categories): No per-endpoint rate limiting (global limiter applies)

**Per-Endpoint Auth:** Apply authentication/authorization per-endpoint, not at router level (except cart which uses `optionalAuth` at router level for guest support).

### Controller Patterns

**Use asyncHandler wrapper:** All controller methods must be wrapped with `asyncHandler()`:
```typescript
export const controller = {
  getAll: asyncHandler((req: Request, res: Response) => {
    // handler code
  }),
};
```

**Response helpers:** Always use helpers from `utils/success.ts`:
- `sendSuccess(res, data)` - 200 status for existing resources
- `sendCreated(res, data)` - 201 status for newly created resources
- `sendPaginated(res, data, meta)` - 200 status with pagination metadata

**Null return pattern:** For single-resource lookups, services return `null` when not found. Controllers throw `NotFoundError`:
```typescript
const resource = service.getById(id);
if (!resource) throw new NotFoundError('ResourceName');
sendSuccess(res, resource);
```

**Query params access:** Use `res.locals.query` for validated query parameters (set by `validateQuery` middleware).

### Service Patterns

**Return types:**
- Single resource: Return `T | null` (null when not found)
- List: Return `PaginatedResult<T>` using `paginate()` helper
- Create: Return `T` (the created resource)
- Update/Delete: Return `T | null` (null when not found)

**Business validation:** Throw `BadRequestError` for business rule violations:
```typescript
if (!isValid) {
  throw new BadRequestError('Descriptive error message');
}
```

**ID generation:** Use `nanoid()` for generating unique IDs.

**Slug generation:** Use `generateSlug(name, existingSlugs)` for URL-safe slugs.

### Schema Patterns (Zod)

**Base schema with all fields:**
```typescript
export const resourceSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string({ message: 'Name is required' }).min(1),
  // ... other fields
  createdAt: z.date(),
  updatedAt: z.date(),
});
```

**Create schema:** Omit auto-generated fields, set defaults:
```typescript
export const createResourceSchema = resourceSchema
  .omit({ id: true, slug: true, createdAt: true, updatedAt: true })
  .extend({
    optionalField: z.string().optional().default('default'),
  });
```

**Update schema:** Make all fields optional:
```typescript
export const updateResourceSchema = createResourceSchema.partial();
```

**Query schema:** Extend pagination, use coerce for query string conversion:
```typescript
export const resourceQuerySchema = paginationQuerySchema.extend({
  filter: z.string().optional(),
  booleanFilter: z
    .string()
    .refine((val) => val === 'true' || val === 'false', {
      message: `Must be "true" or "false"`,
    })
    .optional(),
});
```

**Type inference:** Always export inferred types:
```typescript
export type Resource = z.infer<typeof resourceSchema>;
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
```

### Error Handling

**Custom errors:** Use errors from `utils/errors.ts`:
- `NotFoundError(resource)` - 404, resource not found
- `BadRequestError(message)` - 400, invalid request/business rule violation
- `UnauthorizedError(message)` - 401, authentication required/failed
- `ForbiddenError(message)` - 403, insufficient permissions

**Never catch and swallow errors:** Let errors propagate to the global error handler.

### Pagination

**All list endpoints must be paginated:**
- Use `paginationQuerySchema` as base for query validation
- Use `paginate(items, { page, limit })` helper in services
- Use `sendPaginated(res, data, meta)` in controllers
- Default: page=1, limit=10, max limit=100

**Meta format:**
```typescript
{ total: number, page: number, limit: number, totalPages: number }
```

---

## Testing Rules

### Integration Tests

**File location:** `tests/integration/{feature}.test.ts`

**Structure:**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { dataArray } from '../../src/data/{feature}.js';
import { getAdminToken, getUserToken } from '../helpers.js';

const adminToken = getAdminToken();

describe('{Feature} API', () => {
  beforeEach(() => {
    dataArray.length = 0; // Reset data before each test
    // Add any required seed data
  });

  describe('GET /{feature}', () => {
    it('should return empty array', async () => {
      const response = await request(app).get('/{feature}').expect(200);
      expect(response.body.data).toEqual([]);
    });
  });
});
```

**Auth in tests:**
- Use `getAdminToken()` for admin-only endpoints
- Use `getUserToken()` for user endpoints
- Set header: `.set('Authorization', \`Bearer ${token}\`)`

**Assertions:**
- Check status code with `.expect(statusCode)`
- Check response body with `expect(response.body.data)`
- Check success flag: `expect(response.body.success).toBe(true/false)`

### Unit Tests

**File location:** `tests/unit/services/{feature}.test.ts`

**Structure:**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { featureService } from '../../../src/services/{feature}.js';
import { dataArray } from '../../../src/data/{feature}.js';

describe('{Feature} Service', () => {
  beforeEach(() => {
    dataArray.length = 0;
  });

  describe('getAll', () => {
    it('should return paginated results', () => {
      // Add test data
      const result = featureService.getAll({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(expectedLength);
      expect(result.meta.total).toBe(expectedTotal);
    });
  });
});
```

**Mocking:** Use `vi.fn()` and `vi.spyOn()` for mocking:
```typescript
import { vi } from 'vitest';
const spy = vi.spyOn(object, 'method').mockImplementation(() => value);
```

---

## Security Best Practices

- Never commit `.env` files or secrets
- Use JWT Bearer tokens for authentication
- Apply rate limiting to all write operations
- Validate all input with Zod schemas
- Use parameterized queries (when using real DB)
- Apply authorization checks for admin operations
- Scope user resources by `userId` (addresses, orders)

---

## Code Style

- Use TypeScript strict mode
- Prefer `type` imports: `import type { Request } from 'express'`
- Use named exports for services/controllers
- Use default exports for routers
- File naming: kebab-case (e.g., `rate-limiter.ts`)
- Run `npm run check` before committing
