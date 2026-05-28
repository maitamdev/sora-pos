declare module 'pdfkit' {
  import { Readable } from 'stream';

  class PDFDocument extends Readable {
    y: number;
    constructor(options?: Record<string, unknown>);
    fontSize(size: number): this;
    font(name: string): this;
    fillColor(color: string): this;
    strokeColor(color: string): this;
    lineWidth(width: number): this;
    rect(x: number, y: number, width: number, height: number): this;
    roundedRect(x: number, y: number, width: number, height: number, radius: number): this;
    fill(color?: string): this;
    fillAndStroke(fillColor?: string, strokeColor?: string): this;
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
