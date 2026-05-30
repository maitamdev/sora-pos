import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { ProductFilters } from '../types/product.type';
import { successResponse, errorResponse } from '../utils/response';

const parseBoolean = (value: unknown) => value === 'true' || value === true;

export class ProductController {
  static async getAll(req: Request, res: Response) {
    try {
      const filters: ProductFilters = {
        page: parseInt(req.query.page as string, 10) || 1,
        limit: parseInt(req.query.limit as string, 10) || 20,
        search: req.query.search as string | undefined,
        category: req.query.category as string | undefined,
        category_id: req.query.category_id as string | undefined,
        status: req.query.status as ProductFilters['status'],
        lowStock: parseBoolean(req.query.lowStock),
      };

      const result = await ProductService.getAll(req.user!.storeId, filters);
      successResponse(res, result);
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const product = await ProductService.getById(req.user!.storeId, req.params.id);
      if (!product) {
        errorResponse(res, 'Sản phẩm không tồn tại', 404);
        return;
      }
      successResponse(res, product);
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }

  static async getQrCode(req: Request, res: Response) {
    try {
      const qrCode = await ProductService.getQrCode(req.user!.storeId, req.params.id);
      successResponse(res, { qr_code: qrCode });
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const product = await ProductService.create(req.user!.storeId, req.body);
      successResponse(res, product, 'Tạo sản phẩm thành công', 201);
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const product = await ProductService.update(req.user!.storeId, req.params.id, req.body);
      successResponse(res, product, 'Cập nhật sản phẩm thành công');
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await ProductService.delete(req.user!.storeId, req.params.id);
      successResponse(res, null, 'Ẩn sản phẩm thành công');
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }
}
