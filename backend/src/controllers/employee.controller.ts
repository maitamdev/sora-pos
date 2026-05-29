import { Request, Response } from 'express';
import { EmployeeService } from '../services/employee.service';
import { errorResponse, successResponse } from '../utils/response';

export class EmployeeController {
  static async getAll(req: Request, res: Response) {
    try {
      const employees = await EmployeeService.getAll(req.user!.storeId);
      successResponse(res, employees);
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const employee = await EmployeeService.create(req.user!.storeId, req.body, req.user!.role);
      successResponse(res, employee, 'Tạo nhân viên thành công', 201);
    } catch (error) {
      errorResponse(res, (error as Error).message, 400);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const employee = await EmployeeService.update(
        req.user!.storeId,
        req.params.id,
        req.body,
        req.user!.userId,
        req.user!.role
      );
      successResponse(res, employee, 'Cập nhật nhân viên thành công');
    } catch (error) {
      errorResponse(res, (error as Error).message, 400);
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await EmployeeService.deactivate(req.user!.storeId, req.params.id, req.user!.userId, req.user!.role);
      successResponse(res, null, 'Đã khóa tài khoản nhân viên');
    } catch (error) {
      errorResponse(res, (error as Error).message, 400);
    }
  }
}
