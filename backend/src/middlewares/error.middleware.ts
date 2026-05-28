import { Request, Response, NextFunction } from 'express';

/**
 * Global error handling middleware
 * Bắt tất cả lỗi chưa xử lý và trả JSON response
 */
export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('❌ Unhandled Error:', err.message);
  console.error(err.stack);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
