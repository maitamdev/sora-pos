import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

router.get('/', authMiddleware, CategoryController.getAll);
router.get('/:id', authMiddleware, CategoryController.getById);
router.post('/', authMiddleware, roleMiddleware('admin', 'manager'), CategoryController.create);
router.put('/:id', authMiddleware, roleMiddleware('admin', 'manager'), CategoryController.update);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), CategoryController.delete);

export default router;
