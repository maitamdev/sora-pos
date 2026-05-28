import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { successResponse, errorResponse } from '../utils/response';

export class PaymentController {
  static async getByOrderId(req: Request, res: Response) {
    try {
      if (!req.user) { errorResponse(res, 'Chưa xác thực', 401); return; }
      const storeId = req.user.storeId;
      const payments = await PaymentService.getByOrderId(storeId, req.params.orderId);
      successResponse(res, payments);
    } catch (error) { errorResponse(res, (error as Error).message); }
  }

  static async getRecent(req: Request, res: Response) {
    try {
      if (!req.user) { errorResponse(res, 'Chưa xác thực', 401); return; }
      const storeId = req.user.storeId;
      const payments = await PaymentService.getRecent(storeId);
      successResponse(res, payments);
    } catch (error) { errorResponse(res, (error as Error).message); }
  }
}
