import { Router } from 'express';
import { productController } from '../controllers/products.js';
import { validate, validateQuery } from '../middleware/validate.js';
import {
  createProductSchema,
  productQuerySchema,
  updateProductSchema,
} from '../schemas/product.js';
import { strictLimiter } from '../middleware/rate-limiter.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', validateQuery(productQuerySchema), productController.getAll);
router.get('/:identifier', productController.getOne);
router.post(
  '/',
  authenticate,
  authorize('admin'),
  strictLimiter,
  validate(createProductSchema),
  productController.create
);
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  strictLimiter,
  validate(updateProductSchema),
  productController.update
);
router.delete('/:id', authenticate, authorize('admin'), strictLimiter, productController.remove);

export default router;
