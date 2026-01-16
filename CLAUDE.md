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

Run a single test file:
```bash
npx vitest run src/routes/auth.test.ts
```

## Architecture

Express 5 REST API with TypeScript, using in-memory data storage.

### Layer Structure

Each feature follows: `routes → controllers → services → data`

- **routes/** - Express routers with middleware (auth, validation)
- **controllers/** - HTTP request/response handling
- **services/** - Business logic
- **data/** - In-memory arrays (products, categories, users, addresses)
- **schemas/** - Zod schemas for validation and TypeScript types

### Key Patterns

**Authentication:** JWT Bearer tokens via `authenticate` middleware. User info available as `req.user` (userId, email, role).

**Authorization:** Role-based via `authorize('admin')` middleware. Users can only access their own resources (addresses, orders).

**Validation:** Zod schemas with `validate(schema)` middleware. Schemas define both validation and TypeScript types.

**Responses:** Use `sendSuccess(res, data)` and `sendCreated(res, data)` from `utils/success.ts`. Errors thrown are caught by `errorHandler` middleware.

**Error Handling:** Throw custom errors from `utils/errors.ts` (BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError).

### Environment Variables

Required in `.env`:
- `JWT_SECRET` - Min 32 characters
- `JWT_EXPIRES_IN` - Token expiry (default: 15m)
- `PORT` - Server port (default: 3000)
- `LOG_LEVEL` - Pino log level (default: info)

### Testing

Vitest + Supertest for integration tests. Tests use actual app instance with in-memory data. Reset data arrays in `beforeEach`. Use `getAdminToken()` and `getUserToken()` from `src/tests/helpers.ts` for authenticated requests.
