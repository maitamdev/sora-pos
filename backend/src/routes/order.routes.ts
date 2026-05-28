import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateMiddleware } from '../middlewares/validate.middleware';
import { createOrderSchema } from '../validations/order.validation';

const router = Router();

// GET /api/orders
router.get('/', authMiddleware, OrderController.getAll);

// GET /api/orders/:id
router.get('/:id', authMiddleware, OrderController.getById);

// POST /api/orders (tất cả role đều có thể tạo hóa đơn)
router.post('/', authMiddleware, validateMiddleware(createOrderSchema), OrderController.create);

export default router;
