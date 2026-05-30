import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { supabase } from '../config/supabase';
import { getGroqClient, GROQ_MODEL } from '../config/groq';

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

      const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      let text = response.text();
      
      if (text.includes('```json')) {
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      }

      return JSON.parse(text);
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      throw new Error('Lỗi khi nhận diện hình ảnh qua Gemini: ' + error.message);
    }
  }

  // AI nhận diện qua Text (khi không có ảnh)
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

  /**
   * Tính toán gợi ý nhập hàng dựa trên dữ liệu lịch sử bán hàng và phân tích bằng Groq AI
   */
  static async recommendRestock(storeId: string, userId: string, targetDaysInput?: number) {
    const targetDays = targetDaysInput || 14;

    // 1. Lấy toàn bộ sản phẩm đang hoạt động
    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('id, name, sku, stock_quantity, min_stock_level, unit, sell_price')
      .eq('store_id', storeId)
      .eq('is_active', true);

    if (prodErr) throw new Error('Không thể lấy danh sách sản phẩm: ' + prodErr.message);
    if (!products || products.length === 0) {
      return { recommendations: [], ai_insight: 'Cửa hàng hiện chưa có sản phẩm nào.' };
    }

    // 2. Lấy dữ liệu bán hàng trong 30 ngày qua
    const date30DaysAgo = new Date();
    date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);

    const { data: orderDetails, error: salesErr } = await supabase
      .from('order_details')
      .select('product_id, quantity, orders!inner(status, store_id, created_at)')
      .eq('orders.store_id', storeId)
      .eq('orders.status', 'completed')
      .gte('orders.created_at', date30DaysAgo.toISOString());

    if (salesErr) throw new Error('Không thể lấy lịch sử bán hàng: ' + salesErr.message);

    // Tính tổng số lượng đã bán cho mỗi sản phẩm
    const salesMap: Record<string, number> = {};
    if (orderDetails) {
      for (const item of orderDetails) {
        salesMap[item.product_id] = (salesMap[item.product_id] || 0) + item.quantity;
      }
    }

    // 3. Tính toán đề xuất nhập hàng dựa trên công thức
    const itemsToRecommend: any[] = [];
    const allProductsMap: Record<string, any> = {};

    for (const product of products) {
      allProductsMap[product.id] = product;
      const totalSold = salesMap[product.id] || 0;
      const averageDailySales = totalSold / 30;

      // Công thức: recommended_quantity = average_daily_sales * target_days - current_stock
      const neededQty = averageDailySales * targetDays;
      let recommendedQuantity = Math.ceil(neededQty - product.stock_quantity);

      // Gợi ý khi: 1. Tồn kho <= mức tối thiểu HOẶC 2. Dự báo thiếu hàng (recommendedQuantity > 0)
      const needsRestock = product.stock_quantity <= product.min_stock_level || recommendedQuantity > 0;

      if (needsRestock) {
        if (recommendedQuantity <= 0) {
          // Bán chậm nhưng tồn dưới mức min -> Gợi ý nhập lượng an toàn
          recommendedQuantity = Math.max(product.min_stock_level * 2 - product.stock_quantity, 10);
        }

        itemsToRecommend.push({
          product_id: product.id,
          product_name: product.name,
          sku: product.sku,
          current_stock: product.stock_quantity,
          min_stock_level: product.min_stock_level,
          average_daily_sales: parseFloat(averageDailySales.toFixed(2)),
          recommended_quantity: recommendedQuantity,
          unit: product.unit || 'cái',
        });
      }
    }

    if (itemsToRecommend.length === 0) {
      return {
        recommendations: [],
        ai_insight: 'Tồn kho của cửa hàng hiện ở mức rất tốt. Tất cả sản phẩm đều có số lượng an toàn cho 14 ngày tới.',
      };
    }

    // 4. Gửi dữ liệu qua Groq AI để lấy Priority, Reason và Tổng quan Insight
    let aiInsight = 'Đã tạo gợi ý nhập kho thành công.';
    let aiProducts: any[] = [];

    try {
      const groq = await getGroqClient();
      const prompt = `
Bạn là một chuyên gia tối ưu hóa kho hàng và quản lý chuỗi cung ứng AI cho phần mềm Sora POS.
Dưới đây là danh sách các sản phẩm đang có mức tồn kho thấp hoặc tốc độ bán nhanh, cần nhập thêm hàng để bán trong ${targetDays} ngày tới:

${JSON.stringify(itemsToRecommend, null, 2)}

Hãy phân tích kỹ các yếu tố: tốc độ bán hàng hàng ngày (average_daily_sales), lượng tồn kho thực tế, ngưỡng cảnh báo an toàn (min_stock_level) để:
1. Đánh giá lại mức độ ưu tiên nhập hàng (priority: 'high', 'medium', hoặc 'low') cho mỗi sản phẩm.
   - Hướng dẫn: Sản phẩm hết sạch hàng (current_stock = 0) và có tốc độ bán cao -> 'high'. Sản phẩm tồn thấp nhưng bán rất chậm -> 'low'.
2. Viết lý do cụ thể bằng tiếng Việt (reason) ngắn gọn, thuyết phục giải thích tại sao nên nhập lượng hàng này.
3. Viết một nhận định tổng quan bằng tiếng Việt (ai_insight) (khoảng 3-4 câu) đưa ra lời khuyên tối ưu kho hàng chung cho chủ cửa hàng (ví dụ: tập trung dòng tiền vào sản phẩm nào, phân tích xu hướng bán).

Yêu cầu định dạng đầu ra bắt buộc:
Trả về duy nhất dữ liệu định dạng JSON thuần túy (không bao gồm các block markdown như \`\`\`json hay backticks). JSON object phải tuân thủ cấu trúc sau:
{
  "ai_insight": "Đoạn nhận định tổng quan kho hàng bằng tiếng Việt...",
  "products": [
    {
      "product_id": "ID sản phẩm từ danh sách đầu vào",
      "priority": "high" | "medium" | "low",
      "reason": "Lý do nhập..."
    }
  ]
}
`;

      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      let aiResultText = completion.choices[0]?.message?.content || '{}';
      if (aiResultText.includes('```json')) {
        aiResultText = aiResultText.replace(/```json/g, '').replace(/```/g, '').trim();
      }

      const aiResult = JSON.parse(aiResultText);
      aiInsight = aiResult.ai_insight || 'Tồn kho cần được bổ sung kịp thời để đáp ứng nhu cầu bán hàng.';
      aiProducts = aiResult.products || [];
    } catch (groqErr) {
      console.error('Groq Restock AI Error:', groqErr);
      aiInsight = 'Lỗi kết nối AI insights. Danh sách gợi ý được tính toán tự động dựa trên công thức cơ bản.';
    }

    // 5. Tổng hợp dữ liệu kết quả và Lưu trữ vào database
    const recommendations = itemsToRecommend.map((item) => {
      const aiEval = aiProducts.find((p: any) => p.product_id === item.product_id) || {};
      return {
        product_id: item.product_id,
        product_name: item.product_name,
        current_stock: item.current_stock,
        min_stock_level: item.min_stock_level,
        average_daily_sales: item.average_daily_sales,
        recommended_quantity: item.recommended_quantity,
        priority: aiEval.priority || 'medium',
        reason: aiEval.reason || `Mức tồn kho hiện tại (${item.current_stock}) đang thấp hơn ngưỡng tối thiểu (${item.min_stock_level}).`,
        ai_insight: aiInsight,
      };
    });

    // Lưu vào bảng ai_recommendations để xem lại lịch sử
    try {
      const recordsToInsert = recommendations.map((r) => ({
        product_id: r.product_id,
        current_stock: r.current_stock,
        min_stock_level: r.min_stock_level,
        average_daily_sales: r.average_daily_sales,
        recommended_quantity: r.recommended_quantity,
        priority: r.priority,
        reason: r.reason,
        ai_insight: r.ai_insight,
        created_by: userId,
        status: 'pending',
      }));

      // Xóa các gợi ý cũ 'pending' của store này trước khi tạo mới để tránh trùng lặp
      const productIds = products.map(p => p.id);
      await supabase
        .from('ai_recommendations')
        .delete()
        .in('product_id', productIds)
        .eq('status', 'pending');

      await supabase.from('ai_recommendations').insert(recordsToInsert);
    } catch (dbErr) {
      console.error('Error saving AI recommendations:', dbErr);
    }

    return {
      recommendations,
      ai_insight: aiInsight,
    };
  }

  /**
   * Lấy lịch sử gợi ý nhập hàng AI của cửa hàng
   */
  static async getHistory(storeId: string) {
    const { data, error } = await supabase
      .from('ai_recommendations')
      .select('*, products!inner(name, sku, store_id)')
      .eq('products.store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw new Error('Không thể lấy lịch sử gợi ý: ' + error.message);

    return (data || []).map((row: any) => ({
      id: row.id,
      product_id: row.product_id,
      product_name: row.products?.name || 'Sản phẩm đã xóa',
      sku: row.products?.sku || '',
      current_stock: row.current_stock,
      min_stock_level: row.min_stock_level,
      average_daily_sales: Number(row.average_daily_sales),
      recommended_quantity: row.recommended_quantity,
      priority: row.priority,
      reason: row.reason,
      ai_insight: row.ai_insight,
      status: row.status,
      created_at: row.created_at,
    }));
  }
}
