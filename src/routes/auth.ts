import { Router } from 'express';
import { authController } from '../controllers/auth.js';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { registerSchema, loginSchema, updateRoleSchema } from '../schemas/user.js';
import { strictLimiter } from '../middleware/rate-limiter.js';

const router = Router();

router.post('/register', strictLimiter, validate(registerSchema), authController.register);
router.post('/login', strictLimiter, validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);
router.patch(
  '/users/:id/role',
  authenticate,
  authorize('admin'),
  validate(updateRoleSchema),
  authController.updateRole
);

export default router;
