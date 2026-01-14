import express from 'express';
import cors from 'cors';
import type { NextFunction, Request, Response } from 'express';
import productRoutes from './routes/products.js';

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
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
