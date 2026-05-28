import { Router } from 'express';
import { SupplierController } from '../controllers/supplier.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

router.get('/', authMiddleware, SupplierController.getAll);
router.get('/:id', authMiddleware, SupplierController.getById);
router.post('/', authMiddleware, roleMiddleware('admin', 'manager'), SupplierController.create);
router.put('/:id', authMiddleware, roleMiddleware('admin', 'manager'), SupplierController.update);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), SupplierController.delete);

export default router;
