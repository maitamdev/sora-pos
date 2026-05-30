import { Request, Response } from 'express';
import { SupplierService } from '../services/supplier.service';
import { successResponse, errorResponse } from '../utils/response';
import { SupplierFilters } from '../types/supplier.type';

export class SupplierController {
  static async getAll(req: Request, res: Response) {
    try {
      const storeId = req.user!.storeId;
      const filters: SupplierFilters = {
        page: parseInt(req.query.page as string, 10) || 1,
        limit: parseInt(req.query.limit as string, 10) || 20,
        search: req.query.search as string | undefined,
        status: req.query.status as SupplierFilters['status'],
      };

      const result = await SupplierService.getAll(storeId, filters);
      successResponse(res, result);
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const storeId = req.user!.storeId;
      const supplier = await SupplierService.getById(storeId, req.params.id);
      if (!supplier) {
        errorResponse(res, 'Nhà cung cấp không tồn tại', 404);
        return;
      }
      successResponse(res, supplier);
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const storeId = req.user!.storeId;
      const supplier = await SupplierService.create(storeId, req.body);
      successResponse(res, supplier, 'Tạo nhà cung cấp thành công', 201);
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const storeId = req.user!.storeId;
      const supplier = await SupplierService.update(storeId, req.params.id, req.body);
      successResponse(res, supplier, 'Cập nhật nhà cung cấp thành công');
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const storeId = req.user!.storeId;
      await SupplierService.delete(storeId, req.params.id);
      successResponse(res, null, 'Ẩn nhà cung cấp thành công');
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }
}
