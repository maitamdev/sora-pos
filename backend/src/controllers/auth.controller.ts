import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/response';

export class AuthController {
  /**
   * POST /api/auth/login
   * Đăng nhập bằng email/password
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      successResponse(res, result, 'Đăng nhập thành công');
    } catch (error) {
      errorResponse(res, (error as Error).message, 401);
    }
  }

  /**
   * GET /api/auth/me
   * Lấy thông tin user hiện tại từ JWT token
   * Dùng để verify token khi reload trang
   */
  static async getMe(req: Request, res: Response) {
    try {
      if (!req.user) {
        errorResponse(res, 'Chưa xác thực', 401);
        return;
      }

      const user = await AuthService.getProfile(req.user.userId);
      if (!user) {
        errorResponse(res, 'Tài khoản không tồn tại hoặc đã bị vô hiệu hóa', 401);
        return;
      }

      successResponse(res, { user }, 'Xác thực thành công');
    } catch (error) {
      errorResponse(res, (error as Error).message, 500);
    }
  }

  /**
   * GET /api/auth/profile
   * Alias cho getMe - tương thích code cũ
   */
  static async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        errorResponse(res, 'Chưa xác thực', 401);
        return;
      }
      const user = await AuthService.getProfile(req.user.userId);
      if (!user) {
        errorResponse(res, 'Không tìm thấy user', 404);
        return;
      }
      successResponse(res, user);
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }

  /**
   * POST /api/auth/logout
   * JWT là stateless, logout xử lý ở frontend bằng cách xóa token
   */
  static async logout(_req: Request, res: Response) {
    successResponse(res, null, 'Đăng xuất thành công');
  }

  /**
   * POST /api/auth/register
   * Đăng ký tài khoản quản lý cửa hàng mới
   */
  static async register(req: Request, res: Response) {
    try {
      const { email, password, full_name, phone, store_name } = req.body;
      const result = await AuthService.register({ email, password, full_name, phone, store_name });
      successResponse(res, result, 'Đăng ký tài khoản thành công', 201);
    } catch (error) {
      errorResponse(res, (error as Error).message, 400);
    }
  }
}
