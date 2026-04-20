import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

export interface PdfDocumentOptions {
  size?: string;
  margin?: number;
}

@Injectable()
export class PdfKitGeneratorService {
  createDocument(options: PdfDocumentOptions = {}): typeof PDFDocument {
    const size = options.size || 'A4';
    const margin = options.margin || 50;
    return new PDFDocument({ size, margin });
  }
}