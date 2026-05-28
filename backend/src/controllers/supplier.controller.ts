import { Request, Response } from 'express';
import { SupplierService } from '../services/supplier.service';
import { successResponse, errorResponse } from '../utils/response';

export class SupplierController {
  static async getAll(_req: Request, res: Response) {
    try {
      const suppliers = await SupplierService.getAll();
      successResponse(res, suppliers);
    } catch (error) { errorResponse(res, (error as Error).message); }
  }

  static async getById(req: Request, res: Response) {
    try {
      const supplier = await SupplierService.getById(req.params.id);
      if (!supplier) { errorResponse(res, 'NCC không tồn tại', 404); return; }
      successResponse(res, supplier);
    } catch (error) { errorResponse(res, (error as Error).message); }
  }

  static async create(req: Request, res: Response) {
    try {
      const supplier = await SupplierService.create(req.body);
      successResponse(res, supplier, 'Tạo NCC thành công', 201);
    } catch (error) { errorResponse(res, (error as Error).message); }
  }

  static async update(req: Request, res: Response) {
    try {
      const supplier = await SupplierService.update(req.params.id, req.body);
      successResponse(res, supplier, 'Cập nhật NCC thành công');
    } catch (error) { errorResponse(res, (error as Error).message); }
  }

  static async delete(req: Request, res: Response) {
    try {
      await SupplierService.delete(req.params.id);
      successResponse(res, null, 'Xóa NCC thành công');
    } catch (error) { errorResponse(res, (error as Error).message); }
  }
}
