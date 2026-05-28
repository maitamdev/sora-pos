import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/recent', authMiddleware, PaymentController.getRecent);
router.get('/order/:orderId', authMiddleware, PaymentController.getByOrderId);

export default router;
