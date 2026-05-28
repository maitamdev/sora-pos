import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/user.type';
import { errorResponse } from '../utils/response';

/**
 * Middleware phân quyền
 * Kiểm tra role của user có nằm trong danh sách cho phép không
 *
 * Sử dụng: roleMiddleware('admin', 'manager')
 * Yêu cầu: authMiddleware phải chạy trước
 */
export const roleMiddleware = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Chưa xác thực', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      errorResponse(
        res,
        `Bạn không có quyền truy cập. Yêu cầu: ${allowedRoles.join(', ')}`,
        403
      );
      return;
    }

    next();
  };
};
