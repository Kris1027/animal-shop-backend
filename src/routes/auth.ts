import { Router } from 'express';
import { authController } from '../controllers/auth.js';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize, rejectAuthenticated } from '../middleware/auth.js';
import { registerSchema, loginSchema, updateRoleSchema } from '../schemas/user.js';
import { strictLimiter } from '../middleware/rate-limiter.js';

const router = Router();

router.get('/users', authenticate, authorize('admin'), authController.getAll);
router.post(
  '/register',
  rejectAuthenticated,
  strictLimiter,
  validate(registerSchema),
  authController.register
);
router.post(
  '/login',
  rejectAuthenticated,
  strictLimiter,
  validate(loginSchema),
  authController.login
);
router.get('/me', authenticate, authController.me);
router.patch(
  '/users/:id/role',
  authenticate,
  authorize('admin'),
  validate(updateRoleSchema),
  authController.updateRole
);
router.post('/logout', authenticate, authController.logout);

export default router;
