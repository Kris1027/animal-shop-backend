import { Router } from 'express';
import { productController } from '../controllers/products.js';
import { validate, validateQuery } from '../middleware/validate.js';
import {
  createProductSchema,
  productQuerySchema,
  updateProductSchema,
} from '../schemas/product.js';

const router = Router();

router.get('/', validateQuery(productQuerySchema), productController.getAll);
router.get('/:identifier', productController.getOne);
router.post('/', validate(createProductSchema), productController.create);
router.put('/:id', validate(updateProductSchema), productController.update);
router.delete('/:id', productController.remove);

export default router;
