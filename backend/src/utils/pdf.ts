import PDFDocument from 'pdfkit';

interface InvoicePdfInput {
  order: {
    order_number: string;
    created_at: string;
    total_amount: number;
    discount_amount: number;
    final_amount: number;
    status: string;
    customers?: { name?: string; phone?: string } | null;
    users?: { full_name?: string } | null;
  };
  order_details: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    discount: number;
    subtotal: number;
  }>;
  payment?: {
    method: string;
    received_amount: number;
    change_amount: number;
    status: string;
  } | null;
}

const money = (value: number) => `${Number(value || 0).toLocaleString('vi-VN')} VND`;

export const generateInvoicePDF = async (invoice: InvoicePdfInput): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer | Uint8Array) => chunks.push(Buffer.from(chunk)));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('Aivo POS', { align: 'center' });
    doc.fontSize(14).text('HOA DON BAN HANG', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`Mã hóa đơn: ${invoice.order.order_number}`);
    doc.text(`Ngày tạo: ${new Date(invoice.order.created_at).toLocaleString('vi-VN')}`);
    doc.text(`Nhân viên: ${invoice.order.users?.full_name || 'N/A'}`);
    doc.text(`Khách hàng: ${invoice.order.customers?.name || 'Khách lẻ'}`);
    if (invoice.order.customers?.phone) doc.text(`SDT: ${invoice.order.customers.phone}`);
    doc.text(`Trạng thái: ${invoice.order.status}`);
    doc.moveDown();

    const startY = doc.y;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Sản phẩm', 40, startY, { width: 220 });
    doc.text('SL', 270, startY, { width: 40, align: 'right' });
    doc.text('Đơn giá', 320, startY, { width: 80, align: 'right' });
    doc.text('Giảm', 410, startY, { width: 60, align: 'right' });
    doc.text('Thành tiền', 480, startY, { width: 75, align: 'right' });
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.5);
    doc.font('Helvetica');

    invoice.order_details.forEach((detail) => {
      const rowY = doc.y;
      doc.text(detail.product_name, 40, rowY, { width: 220 });
      doc.text(String(detail.quantity), 270, rowY, { width: 40, align: 'right' });
      doc.text(money(detail.unit_price), 320, rowY, { width: 80, align: 'right' });
      doc.text(money(detail.discount), 410, rowY, { width: 60, align: 'right' });
      doc.text(money(detail.subtotal), 480, rowY, { width: 75, align: 'right' });
      doc.moveDown(0.8);
    });

    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown();
    doc.text(`Tạm tính: ${money(invoice.order.total_amount)}`, { align: 'right' });
    doc.text(`Giảm giá: ${money(invoice.order.discount_amount)}`, { align: 'right' });
    doc.font('Helvetica-Bold').fontSize(12).text(`Tổng thanh toán: ${money(invoice.order.final_amount)}`, { align: 'right' });
    doc.font('Helvetica').fontSize(10);

    if (invoice.payment) {
      doc.moveDown();
      doc.text(`Thanh toán: ${invoice.payment.method}`);
      doc.text(`Tiền nhận: ${money(invoice.payment.received_amount)}`);
      doc.text(`Tiền thừa: ${money(invoice.payment.change_amount)}`);
      doc.text(`Trạng thái thanh toán: ${invoice.payment.status}`);
    }

    doc.moveDown(2);
    doc.text('Cam on quy khach!', { align: 'center' });
    doc.end();
  });
};
