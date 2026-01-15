import type { Request, Response } from 'express';

import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import { errorHandler } from './middleware/error-handler.js';
import { httpLogger } from './middleware/http-logger.js';
import { globalLimiter } from './middleware/rate-limiter.js';
import helmet from 'helmet';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(healthRoutes);
app.use(globalLimiter);
app.use(httpLogger);

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Animal Shop API' });
});

app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`,
    code: 'ROUTE_NOT_FOUND',
  });
});

app.use(errorHandler);

export default app;
