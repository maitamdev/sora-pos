import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateMiddleware } from '../middlewares/validate.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { loginSchema, storeRegisterSchema } from '../validations/auth.validation';

const router = Router();

// POST /api/auth/login
router.post('/login', validateMiddleware(loginSchema), AuthController.login);

// POST /api/auth/register
router.post('/register', validateMiddleware(storeRegisterSchema), AuthController.register);

// POST /api/auth/logout
router.post('/logout', authMiddleware, AuthController.logout);

// GET /api/auth/me - Lấy thông tin user hiện tại (verify token + trả user info)
router.get('/me', authMiddleware, AuthController.getMe);

// GET /api/auth/profile - Alias cho /me (tương thích code cũ)
router.get('/profile', authMiddleware, AuthController.getProfile);

export default router;
