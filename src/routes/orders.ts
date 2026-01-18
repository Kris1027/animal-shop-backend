import { Router } from 'express';
import { orderController } from '../controllers/orders.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { createOrderSchema, updateOrderStatusSchema, orderQuerySchema } from '../schemas/order.js';
import { strictLimiter } from '../middleware/rate-limiter.js';

const router = Router();

router.get('/', authenticate, validateQuery(orderQuerySchema), orderController.getAll);
router.get('/:id', authenticate, orderController.getById);
router.post('/', authenticate, strictLimiter, validate(createOrderSchema), orderController.create);
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin'),
  strictLimiter,
  validate(updateOrderStatusSchema),
  orderController.updateStatus
);
router.patch('/:id/cancel', authenticate, strictLimiter, orderController.cancel);

export default router;
