import { Request, Response } from 'express';
import { ReportService } from '../services/report.service';
import { successResponse, errorResponse } from '../utils/response';

export class ReportController {
  static async getDashboard(req: Request, res: Response) {
    try {
      if (!req.user) { errorResponse(res, 'Chưa xác thực', 401); return; }
      const storeId = req.user.storeId;
      const data = await ReportService.getDashboard(storeId);
      successResponse(res, data);
    } catch (error) { errorResponse(res, (error as Error).message); }
  }

  static async getTopProducts(req: Request, res: Response) {
    try {
      if (!req.user) { errorResponse(res, 'Chưa xác thực', 401); return; }
      const storeId = req.user.storeId;
      const limit = parseInt(req.query.limit as string) || 10;
      const days = parseInt(req.query.days as string) || 30;
      const data = await ReportService.getTopProducts(storeId, limit, days);
      successResponse(res, data);
    } catch (error) { errorResponse(res, (error as Error).message); }
  }

  static async getRevenueByDay(req: Request, res: Response) {
    try {
      if (!req.user) { errorResponse(res, 'Chưa xác thực', 401); return; }
      const storeId = req.user.storeId;
      const days = parseInt(req.query.days as string) || 7;
      const data = await ReportService.getRevenueByDay(storeId, days);
      successResponse(res, data);
    } catch (error) { errorResponse(res, (error as Error).message); }
  }

  static async getLowStock(req: Request, res: Response) {
    try {
      if (!req.user) { errorResponse(res, 'Chưa xác thực', 401); return; }
      const storeId = req.user.storeId;
      const data = await ReportService.getLowStockProducts(storeId);
      successResponse(res, data);
    } catch (error) { errorResponse(res, (error as Error).message); }
  }
}
