import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

router.get('/', authMiddleware, CustomerController.getAll);
router.get('/:id', authMiddleware, CustomerController.getById);
router.post('/', authMiddleware, roleMiddleware('admin', 'manager', 'cashier'), CustomerController.create);
router.put('/:id', authMiddleware, roleMiddleware('admin', 'manager'), CustomerController.update);

export default router;
