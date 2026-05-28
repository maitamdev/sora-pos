import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { successResponse, errorResponse } from '../utils/response';

export class OrderController {
  static async create(req: Request, res: Response) {
    try {
      if (!req.user) { errorResponse(res, 'Chưa xác thực', 401); return; }
      const storeId = req.user.storeId;
      const result = await OrderService.createOrder(storeId, req.body, req.user.userId);
      successResponse(res, result, 'Tạo hóa đơn thành công', 201);
    } catch (error) {
      errorResponse(res, (error as Error).message, 400);
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const storeId = req.user!.storeId;
      const result = await OrderService.getAll(storeId, page, limit);
      successResponse(res, result);
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const storeId = req.user!.storeId;
      const result = await OrderService.getById(storeId, req.params.id);
      if (!result) { errorResponse(res, 'Hóa đơn không tồn tại', 404); return; }
      successResponse(res, result);
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }
}
