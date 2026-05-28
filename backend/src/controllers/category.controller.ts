import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';
import { successResponse, errorResponse } from '../utils/response';

export class CategoryController {
  static async getAll(_req: Request, res: Response) {
    try {
      const categories = await CategoryService.getAll();
      successResponse(res, categories);
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const category = await CategoryService.getById(req.params.id);
      if (!category) { errorResponse(res, 'Danh mục không tồn tại', 404); return; }
      successResponse(res, category);
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const category = await CategoryService.create(req.body);
      successResponse(res, category, 'Tạo danh mục thành công', 201);
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const category = await CategoryService.update(req.params.id, req.body);
      successResponse(res, category, 'Cập nhật danh mục thành công');
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await CategoryService.delete(req.params.id);
      successResponse(res, null, 'Xóa danh mục thành công');
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }
}
