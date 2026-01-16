import { Router } from 'express';
import { addressController } from '../controllers/addresses.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { createAddressSchema, updateAddressSchema } from '../schemas/address.js';

const router = Router();

router.use(authenticate);

router.get('/', addressController.getAll);
router.get('/:id', addressController.getById);
router.post('/', validate(createAddressSchema), addressController.create);
router.put('/:id', validate(updateAddressSchema), addressController.update);
router.delete('/:id', addressController.delete);
router.patch('/:id/default', addressController.setDefault);

export default router;
