import { Router } from 'express';
import productRoutes from './products.js';
import categoryRoutes from './categories.js';

const router = Router();

router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);

export default router;
