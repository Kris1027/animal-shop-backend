import { Router } from 'express';
import { categoryController } from '../controllers/categories.js';
import { strictLimiter } from '../middleware/rate-limiter.js';
import { validate, validateQuery } from '../middleware/validate.js';
import {
  categoryQuerySchema,
  createCategorySchema,
  updateCategorySchema,
} from '../schemas/category.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', validateQuery(categoryQuerySchema), categoryController.getAll);
router.get(
  '/:identifier/products',
  validateQuery(categoryQuerySchema),
  categoryController.getProductsByCategory
);
router.get('/:identifier', categoryController.getOne);
router.post(
  '/',
  authenticate,
  strictLimiter,
  validate(createCategorySchema),
  categoryController.create
);
router.put(
  '/:id',
  authenticate,
  strictLimiter,
  validate(updateCategorySchema),
  categoryController.update
);
router.delete('/:id', authenticate, strictLimiter, categoryController.remove);

export default router;
