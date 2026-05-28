import { Router } from 'express';
import { StockController } from '../controllers/stock.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { validateMiddleware } from '../middlewares/validate.middleware';
import { stockImportSchema, stockAdjustmentSchema } from '../validations/stock.validation';

const router = Router();

// GET /api/stock/alerts - tất cả role đều xem được cảnh báo
router.get('/alerts', authMiddleware, StockController.getAlerts);

// GET /api/stock/transactions
router.get('/transactions', authMiddleware, StockController.getTransactions);

// POST /api/stock/import (admin, manager)
router.post('/import', authMiddleware, roleMiddleware('admin', 'manager'), validateMiddleware(stockImportSchema), StockController.importStock);

// POST /api/stock/adjust (admin, manager)
router.post('/adjust', authMiddleware, roleMiddleware('admin', 'manager'), validateMiddleware(stockAdjustmentSchema), StockController.adjustStock);

export default router;
