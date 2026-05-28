import { existsSync } from 'fs';
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

const paymentLabel: Record<string, string> = {
  cash: 'Tiền mặt',
  bank_transfer: 'Chuyển khoản',
  e_wallet: 'Ví điện tử',
  qr_mock: 'QR mock',
};

const statusLabel: Record<string, string> = {
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  refunded: 'Hoàn trả',
  paid: 'Đã thanh toán',
  unpaid: 'Chưa thanh toán',
  partial: 'Thanh toán một phần',
};

const findUnicodeFont = () => {
  const candidates = [
    process.env.PDF_FONT_PATH,
    'C:/Windows/Fonts/arial.ttf',
    'C:/Windows/Fonts/segoeui.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
    '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
  ].filter(Boolean) as string[];

  return candidates.find((fontPath) => existsSync(fontPath));
};

const text = (
  doc: PDFDocument,
  value: string,
  x: number,
  y: number,
  width: number,
  options: Record<string, unknown> = {}
) => {
  doc.text(value, x, y, { width, ...options });
};

export const generateInvoicePDF = async (invoice: InvoicePdfInput): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 42 });
    const chunks: Buffer[] = [];
    const fontPath = findUnicodeFont();

    if (fontPath) {
      doc.font(fontPath);
    }

    doc.on('data', (chunk: Buffer | Uint8Array) => chunks.push(Buffer.from(chunk)));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = 595.28;
    const left = 42;
    const right = pageWidth - 42;
    const contentWidth = right - left;
    let y = 42;

    doc.roundedRect(left, y, contentWidth, 74, 10).fill('#0f172a');
    doc.fillColor('#ffffff').fontSize(22).text('Aivo POS', left + 20, y + 18);
    doc.fillColor('#cbd5e1').fontSize(10).text('HÓA ĐƠN BÁN HÀNG', left + 20, y + 45);
    doc.fillColor('#ffffff').fontSize(12).text(invoice.order.order_number, left + 310, y + 20, {
      width: contentWidth - 330,
      align: 'right',
    });
    doc.fillColor('#cbd5e1').fontSize(9).text(new Date(invoice.order.created_at).toLocaleString('vi-VN'), left + 310, y + 44, {
      width: contentWidth - 330,
      align: 'right',
    });
    y += 94;

    doc.fillColor('#0f172a').fontSize(10);
    doc.roundedRect(left, y, contentWidth, 86, 8).fillAndStroke('#f8fafc', '#e2e8f0');
    doc.fillColor('#64748b').fontSize(9).text('KHÁCH HÀNG', left + 16, y + 14);
    doc.fillColor('#0f172a').fontSize(12).text(invoice.order.customers?.name || 'Khách lẻ', left + 16, y + 32, { width: 180 });
    doc.fillColor('#64748b').fontSize(10).text(invoice.order.customers?.phone || 'Không có SĐT', left + 16, y + 52);

    doc.fillColor('#64748b').fontSize(9).text('NHÂN VIÊN', left + 230, y + 14);
    doc.fillColor('#0f172a').fontSize(12).text(invoice.order.users?.full_name || 'N/A', left + 230, y + 32, { width: 150 });

    doc.fillColor('#64748b').fontSize(9).text('THANH TOÁN', left + 400, y + 14);
    doc.fillColor('#0f172a').fontSize(12).text(paymentLabel[invoice.payment?.method || ''] || invoice.payment?.method || 'N/A', left + 400, y + 32, {
      width: 110,
      align: 'right',
    });
    doc.fillColor('#16a34a').fontSize(10).text(statusLabel[invoice.payment?.status || ''] || invoice.payment?.status || '', left + 400, y + 54, {
      width: 110,
      align: 'right',
    });
    y += 112;

    doc.fillColor('#0f172a').fontSize(12).text('Chi tiết sản phẩm', left, y);
    y += 22;

    doc.roundedRect(left, y, contentWidth, 30, 6).fill('#f1f5f9');
    doc.fillColor('#475569').fontSize(9);
    text(doc, 'Sản phẩm', left + 12, y + 10, 230);
    text(doc, 'SL', left + 272, y + 10, 34, { align: 'right' });
    text(doc, 'Đơn giá', left + 320, y + 10, 72, { align: 'right' });
    text(doc, 'Giảm', left + 404, y + 10, 56, { align: 'right' });
    text(doc, 'Thành tiền', left + 470, y + 10, 50, { align: 'right' });
    y += 34;

    invoice.order_details.forEach((detail, index) => {
      const rowHeight = 38;
      if (index % 2 === 1) {
        doc.rect(left, y - 2, contentWidth, rowHeight).fill('#fbfdff');
      }

      doc.fillColor('#0f172a').fontSize(10);
      text(doc, detail.product_name, left + 12, y + 8, 230);
      doc.fillColor('#475569').fontSize(10);
      text(doc, String(detail.quantity), left + 272, y + 8, 34, { align: 'right' });
      text(doc, money(detail.unit_price), left + 320, y + 8, 72, { align: 'right' });
      text(doc, money(detail.discount), left + 404, y + 8, 56, { align: 'right' });
      doc.fillColor('#0f172a');
      text(doc, money(detail.subtotal), left + 470, y + 8, 50, { align: 'right' });
      y += rowHeight;
    });

    y += 12;
    const totalBoxX = left + 285;
    doc.roundedRect(totalBoxX, y, contentWidth - 285, 118, 8).fillAndStroke('#0f172a', '#0f172a');
    doc.fillColor('#cbd5e1').fontSize(10).text('Tạm tính', totalBoxX + 16, y + 16);
    doc.text(money(invoice.order.total_amount), totalBoxX + 120, y + 16, { width: contentWidth - 421, align: 'right' });
    doc.text('Giảm giá', totalBoxX + 16, y + 40);
    doc.text(money(invoice.order.discount_amount), totalBoxX + 120, y + 40, { width: contentWidth - 421, align: 'right' });
    doc.strokeColor('#334155').moveTo(totalBoxX + 16, y + 66).lineTo(right - 16, y + 66).stroke();
    doc.fillColor('#ffffff').fontSize(13).text('Tổng thanh toán', totalBoxX + 16, y + 78);
    doc.fontSize(16).text(money(invoice.order.final_amount), totalBoxX + 120, y + 76, {
      width: contentWidth - 421,
      align: 'right',
    });

    y += 142;
    if (invoice.payment) {
      doc.fillColor('#475569').fontSize(10);
      doc.text(`Tiền nhận: ${money(invoice.payment.received_amount)}   |   Tiền thừa: ${money(invoice.payment.change_amount)}`, left, y);
      y += 18;
    }

    doc.fillColor('#64748b').fontSize(10).text('Cảm ơn quý khách và hẹn gặp lại!', left, y + 24, {
      width: contentWidth,
      align: 'center',
    });

    doc.end();
  });
};
