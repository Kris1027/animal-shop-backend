import { Router } from 'express';
import { cartController } from '../controllers/cart.js';
import { validate } from '../middleware/validate.js';
import { optionalAuth } from '../middleware/auth.js';
import {
  addToCartSchema,
  updateCartItemSchema,
  checkoutSchema,
  setShippingAddressSchema,
} from '../schemas/cart.js';
import { extractGuestId } from '../middleware/guest.js';

const router = Router();

router.use(extractGuestId);
router.use(optionalAuth);

router.get('/', cartController.get);
router.post('/items', validate(addToCartSchema), cartController.addItem);
router.patch('/items/:productId', validate(updateCartItemSchema), cartController.updateItem);
router.delete('/items/:productId', cartController.removeItem);
router.delete('/', cartController.clear);
router.put(
  '/shipping-address',
  validate(setShippingAddressSchema),
  cartController.setShippingAddress
);
router.post('/checkout', validate(checkoutSchema), cartController.checkout);

export default router;
