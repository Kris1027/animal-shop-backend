import { Router } from 'express';
import { categoryController } from '../controllers/categories.js';
import { strictLimiter } from '../middleware/rate-limiter.js';
import { validate } from '../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from '../schemas/category.js';

const router = Router();

router.get('/', categoryController.getAll);
router.get('/:identifier', categoryController.getOne);
router.post('/', strictLimiter, validate(createCategorySchema), categoryController.create);
router.put('/:id', strictLimiter, validate(updateCategorySchema), categoryController.update);
router.delete('/:id', strictLimiter, categoryController.remove);

export default router;
