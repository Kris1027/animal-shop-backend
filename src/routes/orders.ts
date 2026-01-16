import { Router } from 'express';
import { orderController } from '../controllers/orders.js';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { createOrderSchema, updateOrderStatusSchema } from '../schemas/order.js';

const router = Router();

router.use(authenticate);

router.get('/', orderController.getAll);
router.get('/:id', orderController.getById);
router.post('/', validate(createOrderSchema), orderController.create);
router.patch(
  '/:id/status',
  authorize('admin'),
  validate(updateOrderStatusSchema),
  orderController.updateStatus
);
router.patch('/:id/cancel', orderController.cancel);

export default router;
