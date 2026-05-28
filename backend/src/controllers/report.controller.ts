import { Request, Response } from 'express';
import { ReportService } from '../services/report.service';
import { successResponse, errorResponse } from '../utils/response';

export class ReportController {
  static async getDashboard(_req: Request, res: Response) {
    try {
      const data = await ReportService.getDashboard();
      successResponse(res, data);
    } catch (error) { errorResponse(res, (error as Error).message); }
  }

  static async getTopProducts(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const days = parseInt(req.query.days as string) || 30;
      const data = await ReportService.getTopProducts(limit, days);
      successResponse(res, data);
    } catch (error) { errorResponse(res, (error as Error).message); }
  }

  static async getRevenueByDay(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const data = await ReportService.getRevenueByDay(days);
      successResponse(res, data);
    } catch (error) { errorResponse(res, (error as Error).message); }
  }

  static async getLowStock(_req: Request, res: Response) {
    try {
      const data = await ReportService.getLowStockProducts();
      successResponse(res, data);
    } catch (error) { errorResponse(res, (error as Error).message); }
  }
}
