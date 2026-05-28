import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

// GET /api/reports/dashboard
router.get('/dashboard', authMiddleware, ReportController.getDashboard);

// GET /api/reports/top-products
router.get('/top-products', authMiddleware, roleMiddleware('admin', 'manager'), ReportController.getTopProducts);

// GET /api/reports/revenue
router.get('/revenue', authMiddleware, roleMiddleware('admin', 'manager'), ReportController.getRevenueByDay);

// GET /api/reports/low-stock
router.get('/low-stock', authMiddleware, ReportController.getLowStock);

export default router;
