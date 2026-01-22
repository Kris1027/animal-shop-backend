# Animal Shop Backend

A RESTful API for an e-commerce pet shop application built with Express 5 and TypeScript. Features JWT authentication, shopping cart with guest support, order management, and comprehensive input validation.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [API Endpoints](#api-endpoints)
  - [Health](#health)
  - [Authentication](#authentication)
  - [Products](#products)
  - [Categories](#categories)
  - [Cart](#cart)
  - [Orders](#orders)
  - [Addresses](#addresses)
- [Project Structure](#project-structure)
- [Authentication](#authentication-1)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [License](#license)

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js 18+ |
| Framework | Express 5.2 |
| Language | TypeScript 5.9 |
| Validation | Zod 4.3 |
| Authentication | JWT (jsonwebtoken) |
| Password Hashing | bcrypt |
| Security | Helmet, CORS, Rate Limiting |
| Logging | Pino |
| Testing | Vitest, Supertest |
| Code Quality | ESLint, Prettier |

## Getting Started

### Prerequisites

- Node.js 18.x or higher
  ```bash
  node --version
  ```

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/animal-shop-backend.git
   cd animal-shop-backend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

5. Access the API at `http://localhost:3000`

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `LOG_LEVEL` | Pino log level (fatal, error, warn, info, debug, trace) | `info` |
| `JWT_SECRET` | Secret key for JWT signing (min 32 characters) | **Required** |
| `JWT_EXPIRES_IN` | Token expiry duration (e.g., 15m, 1h, 7d) | `15m` |

Generate a secure JWT secret:
```bash
openssl rand -base64 32
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run check` | Run Prettier + ESLint + TypeScript checks |
| `npm run test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

## API Endpoints

All list endpoints support pagination with query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/ready` | Readiness check |

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login (merges guest cart) |
| POST | `/auth/logout` | Yes | Logout |
| GET | `/auth/me` | Yes | Get current user profile |
| GET | `/auth/users` | Admin | List all users (paginated) |
| PATCH | `/auth/users/:id/role` | Admin | Update user role |

**Register Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "role": "user" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | No | List products (filterable) |
| GET | `/products/:identifier` | No | Get product by ID or slug |
| POST | `/products` | Admin | Create product |
| PUT | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Delete product |

**Query Parameters:**
- `category` - Filter by category slug
- `featured` - Filter by featured status (`true`/`false`)

**Product Object:**
```json
{
  "id": "abc123",
  "slug": "premium-dog-food",
  "name": "Premium Dog Food",
  "description": "High-quality nutrition",
  "price": 29.99,
  "stock": 100,
  "image": "https://example.com/image.jpg",
  "banner": "https://example.com/banner.jpg",
  "category": "food",
  "isFeatured": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | No | List categories |
| GET | `/categories/:identifier` | No | Get category by ID or slug |
| GET | `/categories/:identifier/products` | No | Get products in category |
| POST | `/categories` | Admin | Create category |
| PUT | `/categories/:id` | Admin | Update category |
| DELETE | `/categories/:id` | Admin | Delete category |

### Cart

Supports both guest and authenticated users. Guest carts use `X-Guest-Id` header.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/cart` | Optional | Get current cart |
| POST | `/cart/items` | Optional | Add item to cart |
| PATCH | `/cart/items/:productId` | Optional | Update item quantity |
| DELETE | `/cart/items/:productId` | Optional | Remove item from cart |
| DELETE | `/cart` | Optional | Clear entire cart |
| PUT | `/cart/shipping-address` | Yes | Set shipping address |
| POST | `/cart/checkout` | Yes | Checkout and create order |

**Add Item Request:**
```json
{
  "productId": "abc123",
  "quantity": 2
}
```

**Cart Response:**
```json
{
  "success": true,
  "data": {
    "id": "cart123",
    "items": [
      {
        "productId": "abc123",
        "quantity": 2,
        "product": { "name": "...", "price": 29.99, "stock": 100 },
        "lineTotal": 59.98
      }
    ],
    "itemCount": 2,
    "uniqueItemCount": 1,
    "total": 59.98,
    "shippingAddressId": null
  }
}
```

### Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/orders` | Yes | Get user's orders |
| GET | `/orders/:id` | Yes | Get order details |
| POST | `/orders` | Yes | Create order directly |
| PATCH | `/orders/:id/status` | Admin | Update order status |
| PATCH | `/orders/:id/cancel` | Yes | Cancel pending order |

**Query Parameters:**
- `status` - Filter by status (pending, processing, shipped, delivered, cancelled)

**Order Statuses:**
- `pending` - Initial status, can be cancelled
- `processing` - Being prepared
- `shipped` - In transit
- `delivered` - Completed
- `cancelled` - Cancelled (stock restored)

### Addresses

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/addresses` | Yes | Get user's addresses |
| GET | `/addresses/:id` | Yes | Get address details |
| POST | `/addresses` | Yes | Create address |
| PUT | `/addresses/:id` | Yes | Update address |
| DELETE | `/addresses/:id` | Yes | Delete address |
| PATCH | `/addresses/:id/default` | Yes | Set as default |

**Address Object:**
```json
{
  "id": "addr123",
  "label": "Home",
  "firstName": "John",
  "lastName": "Doe",
  "address1": "123 Main St",
  "address2": "Apt 4",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "country": "USA",
  "phone": "+1234567890",
  "isDefault": true
}
```

## Project Structure

```
src/
├── controllers/     # HTTP request/response handling
├── data/            # In-memory data arrays
├── middleware/      # Auth, validation, error handling, rate limiting
├── routes/          # Express route definitions
├── schemas/         # Zod validation schemas
├── services/        # Business logic layer
├── utils/           # Helpers (errors, responses, pagination)
├── app.ts           # Express app configuration
└── server.ts        # Server entry point

tests/
├── helpers.ts       # Test utilities (token generators)
├── unit/            # Unit tests for services
└── integration/     # API integration tests
```

## Authentication

The API uses JWT Bearer tokens for authentication.

**Request Header:**
```
Authorization: Bearer <token>
```

**Roles:**
- `user` - Standard user (default)
- `admin` - Administrative access

**Seed Users (Development):**
| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | admin |
| user@example.com | user123 | user |
| user2@example.com | user123 | user |

## Rate Limiting

| Limiter | Limit | Window | Applied To |
|---------|-------|--------|------------|
| Global | 100 requests | 15 minutes | All endpoints |
| Strict | 20 requests | 15 minutes | Write operations (POST, PUT, PATCH, DELETE) |
| Read | 100 requests | 15 minutes | Authenticated GET endpoints |

## Error Handling

All errors return a consistent JSON format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

**HTTP Status Codes:**
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation errors, business rule violations) |
| 401 | Unauthorized (missing or invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

## Testing

Run all tests:
```bash
npm run test
```

Run specific test suites:
```bash
npx vitest run tests/unit              # Unit tests only
npx vitest run tests/integration       # Integration tests only
npx vitest run tests/integration/auth.test.ts  # Single file
```

Run with coverage:
```bash
npm run test:coverage
```

## License

ISC
