declare module 'pdfkit' {
  import { Readable } from 'stream';

  class PDFDocument extends Readable {
    y: number;
    constructor(options?: Record<string, unknown>);
    fontSize(size: number): this;
    font(name: string): this;
    text(text: string, x?: number, y?: number, options?: Record<string, unknown>): this;
    text(text: string, options?: Record<string, unknown>): this;
    moveDown(lines?: number): this;
    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): this;
    stroke(): this;
    end(): this;
  }

  export default PDFDocument;
}
