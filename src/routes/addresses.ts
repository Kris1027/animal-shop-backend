import { Router } from 'express';
import { addressController } from '../controllers/addresses.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import {
  createAddressSchema,
  updateAddressSchema,
  addressQuerySchema,
} from '../schemas/address.js';
import { strictLimiter, readLimiter } from '../middleware/rate-limiter.js';

const router = Router();

router.get(
  '/',
  authenticate,
  readLimiter,
  validateQuery(addressQuerySchema),
  addressController.getAll
);
router.get('/:id', authenticate, readLimiter, addressController.getById);
router.post(
  '/',
  authenticate,
  strictLimiter,
  validate(createAddressSchema),
  addressController.create
);
router.put(
  '/:id',
  authenticate,
  strictLimiter,
  validate(updateAddressSchema),
  addressController.update
);
router.delete('/:id', authenticate, strictLimiter, addressController.delete);
router.patch('/:id/default', authenticate, strictLimiter, addressController.setDefault);

export default router;
