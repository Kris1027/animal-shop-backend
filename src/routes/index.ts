import { Router } from 'express';
import productRoutes from './products.js';
import categoryRoutes from './categories.js';
import authRoutes from './auth.js';
import addressRoutes from './addresses.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/addresses', addressRoutes);

export default router;
