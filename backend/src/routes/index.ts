import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import employeeRoutes from './employee.routes';
import customerRoutes from './customer.routes';
import orderRoutes from './order.routes';
import paymentRoutes from './payment.routes';
import stockRoutes from './stock.routes';
import reportRoutes from './report.routes';
import aiRoutes from './ai.routes';
import supplierRoutes from './supplier.routes';
import settingsRoutes from './settings.routes';

const router = Router();

// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: '🚀 Sora POS API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/employees', employeeRoutes);
router.use('/customers', customerRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/stock', stockRoutes);
router.use('/reports', reportRoutes);
router.use('/ai', aiRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/settings', settingsRoutes);

export default router;
