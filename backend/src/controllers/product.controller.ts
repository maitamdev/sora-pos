import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { successResponse, errorResponse } from '../utils/response';

export class ProductController {
  static async getAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string | undefined;
      const storeId = req.user!.storeId;

      const result = await ProductService.getAll(storeId, page, limit, search);
      successResponse(res, result);
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const storeId = req.user!.storeId;
      const product = await ProductService.getById(storeId, req.params.id);
      if (!product) {
        errorResponse(res, 'Sản phẩm không tồn tại', 404);
        return;
      }
      successResponse(res, product);
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const storeId = req.user!.storeId;
      const product = await ProductService.create(storeId, req.body);
      successResponse(res, product, 'Tạo sản phẩm thành công', 201);
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const storeId = req.user!.storeId;
      const product = await ProductService.update(storeId, req.params.id, req.body);
      successResponse(res, product, 'Cập nhật sản phẩm thành công');
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const storeId = req.user!.storeId;
      await ProductService.delete(storeId, req.params.id);
      successResponse(res, null, 'Xóa sản phẩm thành công');
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }
}
