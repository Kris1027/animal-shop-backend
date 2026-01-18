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
import { strictLimiter, readLimiter } from '../middleware/rate-limiter.js';

const router = Router();

router.use(extractGuestId);
router.use(optionalAuth);

router.get('/', readLimiter, cartController.get);
router.post('/items', strictLimiter, validate(addToCartSchema), cartController.addItem);
router.patch(
  '/items/:productId',
  strictLimiter,
  validate(updateCartItemSchema),
  cartController.updateItem
);
router.delete('/items/:productId', strictLimiter, cartController.removeItem);
router.delete('/', strictLimiter, cartController.clear);
router.put(
  '/shipping-address',
  strictLimiter,
  validate(setShippingAddressSchema),
  cartController.setShippingAddress
);
router.post('/checkout', strictLimiter, validate(checkoutSchema), cartController.checkout);

export default router;
