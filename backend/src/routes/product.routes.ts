import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { validateMiddleware } from '../middlewares/validate.middleware';
import { createProductSchema, updateProductSchema } from '../validations/product.validation';

const router = Router();

// GET /api/products
router.get('/', authMiddleware, ProductController.getAll);

// GET /api/products/:id
router.get('/:id', authMiddleware, ProductController.getById);

// POST /api/products (admin, manager)
router.post('/', authMiddleware, roleMiddleware('admin', 'manager'), validateMiddleware(createProductSchema), ProductController.create);

// PUT /api/products/:id (admin, manager)
router.put('/:id', authMiddleware, roleMiddleware('admin', 'manager'), validateMiddleware(updateProductSchema), ProductController.update);

// DELETE /api/products/:id (admin, manager)
router.delete('/:id', authMiddleware, roleMiddleware('admin', 'manager'), ProductController.delete);

export default router;
