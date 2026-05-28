import { Router } from 'express';
import { AiController } from '../controllers/ai.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/ai/recognize-product
router.post('/recognize-product', authMiddleware, AiController.recognizeProduct);

export default router;
