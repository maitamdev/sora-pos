import { Request, Response } from 'express';
import { CustomerService } from '../services/customer.service';
import { successResponse, errorResponse } from '../utils/response';

export class CustomerController {
  static async getAll(req: Request, res: Response) {
    try {
      const search = req.query.search as string | undefined;
      const customers = await CustomerService.getAll(search);
      successResponse(res, customers);
    } catch (error) { errorResponse(res, (error as Error).message); }
  }

  static async getById(req: Request, res: Response) {
    try {
      const customer = await CustomerService.getById(req.params.id);
      if (!customer) { errorResponse(res, 'Khách hàng không tồn tại', 404); return; }
      successResponse(res, customer);
    } catch (error) { errorResponse(res, (error as Error).message); }
  }

  static async create(req: Request, res: Response) {
    try {
      const customer = await CustomerService.create(req.body);
      successResponse(res, customer, 'Tạo khách hàng thành công', 201);
    } catch (error) { errorResponse(res, (error as Error).message); }
  }

  static async update(req: Request, res: Response) {
    try {
      const customer = await CustomerService.update(req.params.id, req.body);
      successResponse(res, customer, 'Cập nhật khách hàng thành công');
    } catch (error) { errorResponse(res, (error as Error).message); }
  }
}
