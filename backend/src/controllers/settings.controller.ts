import { Request, Response } from 'express';
import { SettingsService } from '../services/settings.service';
import { successResponse, errorResponse } from '../utils/response';

export class SettingsController {
  static async get(req: Request, res: Response) {
    try {
      const storeId = req.user!.storeId;
      const settings = await SettingsService.get(storeId);
      successResponse(res, settings);
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const storeId = req.user!.storeId;
      const settings = await SettingsService.update(storeId, req.body);
      successResponse(res, settings, 'Cập nhật cài đặt thành công');
    } catch (error) {
      errorResponse(res, (error as Error).message);
    }
  }
}
