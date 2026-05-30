import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { validateMiddleware } from '../middlewares/validate.middleware';
import { updateSettingsSchema } from '../validations/settings.validation';

const router = Router();

// GET /api/settings - all authenticated users of the store can view settings
router.get('/', authMiddleware, SettingsController.get);

// PUT /api/settings - admin and manager can modify settings
router.put(
  '/',
  authMiddleware,
  roleMiddleware('admin', 'manager'),
  validateMiddleware(updateSettingsSchema),
  SettingsController.update
);

export default router;
