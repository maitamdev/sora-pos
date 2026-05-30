import { Router } from 'express';
import { SupplierController } from '../controllers/supplier.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { validateMiddleware } from '../middlewares/validate.middleware';
import { createSupplierSchema, updateSupplierSchema } from '../validations/supplier.validation';

const router = Router();

// GET /api/suppliers - all authenticated users can view
router.get('/', authMiddleware, SupplierController.getAll);

// GET /api/suppliers/:id
router.get('/:id', authMiddleware, SupplierController.getById);

// POST /api/suppliers (admin, manager)
router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin', 'manager'),
  validateMiddleware(createSupplierSchema),
  SupplierController.create
);

// PUT /api/suppliers/:id (admin, manager)
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('admin', 'manager'),
  validateMiddleware(updateSupplierSchema),
  SupplierController.update
);

// DELETE /api/suppliers/:id (admin, manager)
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('admin', 'manager'),
  SupplierController.delete
);

export default router;
