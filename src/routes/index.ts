import { Router } from 'express';
import productRoutes from './products.js';
import categoryRoutes from './categories.js';
import authRoutes from './auth.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);

export default router;
