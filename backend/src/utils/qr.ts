import QRCode from 'qrcode';

/**
 * Tạo QR code cho sản phẩm
 * QR chứa chuỗi JSON thông tin sản phẩm: SKU, tên, giá bán
 * Trả về chuỗi base64 Data URL (data:image/png;base64,...)
 */
export const generateProductQR = async (productData: {
  sku: string;
  name: string;
  sell_price: number;
}): Promise<string> => {
  try {
    const qrData = JSON.stringify({
      sku: productData.sku,
      name: productData.name,
      price: productData.sell_price,
    });

    const qrBase64 = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 300,
      color: {
        dark: '#0f172a',  // slate-900 for modern branding
        light: '#ffffff', // white
      }
    });

    return qrBase64;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Lỗi khi sinh mã QR cho sản phẩm');
  }
};
