import express from 'express';
import cors from 'cors';
import type { Request, Response } from 'express';
import productRoutes from './routes/products.js';
import { errorHandler } from './middleware/error-handler.js';
import { httpLogger } from './middleware/httpLogger.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(httpLogger);

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Animal Shop API' });
});

app.use('/products', productRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`,
    code: 'ROUTE_NOT_FOUND',
  });
});

app.use(errorHandler);

export default app;
