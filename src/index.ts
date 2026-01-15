import express from 'express';
import cors from 'cors';
import type { Request, Response } from 'express';
import productRoutes from './routes/products.js';
import { errorHandler } from './middleware/error-handler.js';

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection', reason);
  process.exit(1);
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
