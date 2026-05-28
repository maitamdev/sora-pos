import { Request, Response } from 'express';
import { AiService } from '../services/ai.service';
import { successResponse, errorResponse } from '../utils/response';
import { supabase } from '../config/supabase';

export class AiController {
  static async recognizeProduct(req: Request, res: Response) {
    try {
      const { image, productName } = req.body;
      if (!image && (!productName || productName.trim() === '')) {
        errorResponse(res, 'Vui lòng cung cấp hình ảnh hoặc tên sản phẩm', 400);
        return;
      }

      const storeId = req.user!.storeId;
      // Lấy danh sách danh mục để gửi cho AI map
      const { data: categories, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('store_id', storeId)
        .eq('is_active', true);

      if (error) {
        throw new Error('Lỗi khi lấy danh sách danh mục');
      }

      let result;
      if (image) {
        result = await AiService.recognizeProductImage(image, categories || []);
      } else {
        result = await AiService.recognizeProductText(productName, categories || []);
      }
      
      successResponse(res, result, 'Nhận diện bằng AI thành công');
    } catch (error: any) {
      errorResponse(res, error.message);
    }
  }
}
