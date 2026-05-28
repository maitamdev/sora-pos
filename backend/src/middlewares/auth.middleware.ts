import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types/user.type';
import { errorResponse } from '../utils/response';

/**
 * Middleware xác thực JWT token
 * Kiểm tra header Authorization: Bearer <token>
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      errorResponse(res, 'Token không được cung cấp', 401);
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      errorResponse(res, 'Token không hợp lệ', 401);
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;

    // Gán user info vào request
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      errorResponse(res, 'Token đã hết hạn', 401);
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      errorResponse(res, 'Token không hợp lệ', 401);
      return;
    }
    errorResponse(res, 'Lỗi xác thực', 500);
  }
};
