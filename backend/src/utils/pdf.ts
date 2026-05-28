// TODO: Tích hợp PDFKit để xuất hóa đơn PDF
// import PDFDocument from 'pdfkit';

/**
 * Tạo PDF hóa đơn (skeleton)
 * Sẽ implement khi cần xuất hóa đơn
 */
export const generateInvoicePDF = async (orderId: string): Promise<Buffer> => {
  // TODO: Implement PDF generation
  // 1. Lấy thông tin order từ database
  // 2. Lấy order_details
  // 3. Tạo PDF với PDFKit
  // 4. Thêm header: logo, tên cửa hàng, địa chỉ
  // 5. Thêm thông tin khách hàng
  // 6. Thêm bảng sản phẩm
  // 7. Thêm tổng tiền, giảm giá, thành tiền
  // 8. Thêm thông tin thanh toán
  // 9. Trả về Buffer PDF

  console.log(`Generating PDF for order: ${orderId}`);
  return Buffer.from('PDF placeholder');
};
