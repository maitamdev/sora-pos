import { Router } from 'express';
import { AiController } from '../controllers/ai.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/ai/recognize-product
router.post('/recognize-product', authMiddleware, AiController.recognizeProduct);

// POST /api/ai/recommend-restock
router.post('/recommend-restock', authMiddleware, AiController.recommendRestock);

// GET /api/ai/recommendations
router.get('/recommendations', authMiddleware, AiController.getHistory);

export default router;
