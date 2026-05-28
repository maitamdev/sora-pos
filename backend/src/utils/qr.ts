// TODO: Tích hợp thư viện qrcode
// import QRCode from 'qrcode';

/**
 * Tạo QR code cho sản phẩm (skeleton)
 * QR sẽ chứa thông tin: SKU, tên, giá bán
 */
export const generateProductQR = async (productData: {
  sku: string;
  name: string;
  sell_price: number;
}): Promise<string> => {
  // TODO: Implement QR generation
  // 1. Tạo chuỗi dữ liệu sản phẩm
  // 2. Generate QR code dưới dạng base64 hoặc URL
  // 3. Có thể upload lên Supabase Storage

  const qrData = JSON.stringify(productData);
  console.log(`Generating QR for product: ${productData.sku}`, qrData);

  // Placeholder - trả về empty string
  return '';
};
