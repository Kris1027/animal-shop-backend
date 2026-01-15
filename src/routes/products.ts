import { Router } from 'express';
import { productController } from '../controllers/products.js';
import { validate, validateQuery } from '../middleware/validate.js';
import {
  createProductSchema,
  productQuerySchema,
  updateProductSchema,
} from '../schemas/product.js';
import { strictLimiter } from '../middleware/rate-limiter.js';

const router = Router();

router.get('/', validateQuery(productQuerySchema), productController.getAll);
router.get('/:identifier', productController.getOne);
router.post('/', strictLimiter, validate(createProductSchema), productController.create);
router.put('/:id', strictLimiter, validate(updateProductSchema), productController.update);
router.delete('/:id', strictLimiter, productController.remove);

export default router;
