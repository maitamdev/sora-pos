import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { OrderFilters } from '../types/order.type';
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
      const filters: OrderFilters = {
        page: parseInt(req.query.page as string, 10) || 1,
        limit: parseInt(req.query.limit as string, 10) || 20,
        search: req.query.search as string | undefined,
        date_from: req.query.date_from as string | undefined,
        date_to: req.query.date_to as string | undefined,
        user_id: req.query.user_id as string | undefined,
        customer_id: req.query.customer_id as string | undefined,
        status: req.query.status as OrderFilters['status'],
        payment_status: req.query.payment_status as OrderFilters['payment_status'],
      };
      const result = await OrderService.getAll(req.user!.storeId, filters);
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

  static async cancel(req: Request, res: Response) {
    try {
      const result = await OrderService.cancelOrder(req.user!.storeId, req.params.id, req.user!.userId);
      successResponse(res, result, 'Huy hoa don thanh cong');
    } catch (error) {
      errorResponse(res, (error as Error).message, 400);
    }
  }

  static async downloadPdf(req: Request, res: Response) {
    try {
      const pdf = await OrderService.generatePdf(req.user!.storeId, req.params.id);
      if (!pdf) {
        errorResponse(res, 'Hoa don khong ton tai', 404);
        return;
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${req.params.id}.pdf"`);
      res.send(pdf);
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }
}
