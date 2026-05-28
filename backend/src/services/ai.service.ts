import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

// Khởi tạo Gemini Client
const genAI = new GoogleGenerativeAI(env.geminiApiKey || process.env.GEMINI_API_KEY || '');

export class AiService {
  /**
   * Nhận diện ảnh sản phẩm qua Google Gemini và trả về thông tin JSON
   */
  static async recognizeProductImage(base64Image: string, categories: { id: string, name: string }[]): Promise<any> {
    if (!env.geminiApiKey) {
      throw new Error('Google Gemini API Key chưa được cấu hình.');
    }

    const categoriesList = categories.map(c => `- ${c.name} (ID: ${c.id})`).join('\n');

    const prompt = `
Bạn là một chuyên gia AI bán lẻ. 
Hãy quan sát hình ảnh sản phẩm được cung cấp và trích xuất thông tin để tự động điền vào Form tạo sản phẩm mới.

Danh sách các Danh mục hiện có trong hệ thống:
${categoriesList}

Vui lòng trả về kết quả định dạng JSON thuần túy (không chứa markdown, không dùng backticks, chỉ JSON object) với cấu trúc sau:
{
  "name": "Tên sản phẩm chi tiết",
  "description": "Một đoạn mô tả hấp dẫn dành cho sản phẩm này (tiếng Việt)",
  "sku_prefix": "Mã tiền tố SKU gồm 3-4 chữ cái in hoa (ví dụ: Áo thun -> AOT)",
  "suggested_price": Giá bán dự kiến hợp lý trên thị trường VNĐ (số nguyên, ví dụ: 150000),
  "category_id": "ID của danh mục phù hợp nhất từ danh sách trên (nếu không có cái nào phù hợp, trả về rỗng)"
}
`;

    try {
      // Chuẩn bị ảnh cho Gemini
      // Loại bỏ prefix data:image/...;base64, nếu có
      let base64Data = base64Image;
      let mimeType = 'image/jpeg';
      
      if (base64Image.includes('base64,')) {
        const parts = base64Image.split('base64,');
        mimeType = parts[0].replace('data:', '').replace(';', '');
        base64Data = parts[1];
      }

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType || 'image/jpeg'
        }
      };

      // Gọi model gemini-flash-latest
      const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      let text = response.text();
      
      // Clean up markdown block if Gemini wraps it
      if (text.includes('```json')) {
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      }

      return JSON.parse(text);
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      throw new Error('Lỗi khi nhận diện hình ảnh qua Gemini: ' + error.message);
    }
  }

  // Dự phòng: AI nhận diện qua Text (khi không có ảnh)
  static async recognizeProductText(productName: string, categories: { id: string, name: string }[]): Promise<any> {
    if (!env.geminiApiKey) {
      throw new Error('Google Gemini API Key chưa được cấu hình.');
    }

    const categoriesList = categories.map(c => `- ${c.name} (ID: ${c.id})`).join('\n');

    const prompt = `
Bạn là một chuyên gia AI bán lẻ. 
Hãy phân tích tên hoặc từ khóa sản phẩm sau đây: "${productName}"
Và trích xuất thông tin để tự động điền vào Form tạo sản phẩm mới.

Danh sách các Danh mục hiện có trong hệ thống:
${categoriesList}

Vui lòng trả về kết quả định dạng JSON thuần túy (không chứa markdown, không dùng backticks, chỉ JSON object) với cấu trúc sau:
{
  "name": "Tên sản phẩm chuẩn hóa chi tiết và đẹp hơn (dựa trên từ khóa)",
  "description": "Một đoạn mô tả hấp dẫn dành cho sản phẩm này để bán hàng (tiếng Việt)",
  "sku_prefix": "Mã tiền tố SKU gồm 3-4 chữ cái in hoa (ví dụ: Áo thun -> AOT)",
  "suggested_price": Giá bán dự kiến hợp lý trên thị trường VNĐ (số nguyên, ví dụ: 150000),
  "category_id": "ID của danh mục phù hợp nhất từ danh sách trên (nếu không có cái nào phù hợp, trả về rỗng)"
}
`;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
      const result = await model.generateContent(prompt);
      let text = result.response.text();
      
      if (text.includes('```json')) {
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      }

      return JSON.parse(text);
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      throw new Error('Lỗi khi nhận diện qua Gemini: ' + error.message);
    }
  }
}
