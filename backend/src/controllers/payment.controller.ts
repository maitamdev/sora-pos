import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { successResponse, errorResponse } from '../utils/response';

export class PaymentController {
  static async getByOrderId(req: Request, res: Response) {
    try {
      const payments = await PaymentService.getByOrderId(req.params.orderId);
      successResponse(res, payments);
    } catch (error) { errorResponse(res, (error as Error).message); }
  }

  static async getRecent(_req: Request, res: Response) {
    try {
      const payments = await PaymentService.getRecent();
      successResponse(res, payments);
    } catch (error) { errorResponse(res, (error as Error).message); }
  }
}
