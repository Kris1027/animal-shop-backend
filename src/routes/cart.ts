import { Router } from 'express';
import { cartController } from '../controllers/cart.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { addToCartSchema, updateCartItemSchema, checkoutSchema } from '../schemas/cart.js';

const router = Router();

router.use(authenticate);

router.get('/', cartController.get);
router.post('/items', validate(addToCartSchema), cartController.addItem);
router.patch('/items/:productId', validate(updateCartItemSchema), cartController.updateItem);
router.delete('/items/:productId', cartController.removeItem);
router.delete('/', cartController.clear);
router.post('/checkout', validate(checkoutSchema), cartController.checkout);

export default router;
