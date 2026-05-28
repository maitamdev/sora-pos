import { Request, Response } from 'express';
import { StockService } from '../services/stock.service';
import { successResponse, errorResponse } from '../utils/response';

export class StockController {
  static async importStock(req: Request, res: Response) {
    try {
      if (!req.user) { errorResponse(res, 'Chưa xác thực', 401); return; }
      const transaction = await StockService.importStock(req.body, req.user.userId);
      successResponse(res, transaction, 'Nhập kho thành công', 201);
    } catch (error) { errorResponse(res, (error as Error).message, 400); }
  }

  static async adjustStock(req: Request, res: Response) {
    try {
      if (!req.user) { errorResponse(res, 'Chưa xác thực', 401); return; }
      const transaction = await StockService.adjustStock(req.body, req.user.userId);
      successResponse(res, transaction, 'Điều chỉnh tồn kho thành công');
    } catch (error) { errorResponse(res, (error as Error).message, 400); }
  }

  static async getAlerts(_req: Request, res: Response) {
    try {
      const alerts = await StockService.getAlerts();
      successResponse(res, alerts);
    } catch (error) { errorResponse(res, (error as Error).message); }
  }

  static async getTransactions(req: Request, res: Response) {
    try {
      const productId = req.query.product_id as string | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const result = await StockService.getTransactions(productId, page);
      successResponse(res, result);
    } catch (error) { errorResponse(res, (error as Error).message); }
  }
}
