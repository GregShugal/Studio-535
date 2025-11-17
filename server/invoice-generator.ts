import PDFDocument from "pdfkit";
import { Readable } from "stream";

export interface InvoiceData {
  invoiceNumber: string;
  orderDate: Date;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax?: number;
  total: number;
  paymentMethod: string;
  transactionId?: string;
}

/**
 * Generate a PDF invoice and return as Buffer
 */
export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks: Buffer[] = [];

      // Collect PDF data
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Header - Studio 535 Branding
      doc
        .fontSize(28)
        .font("Helvetica-Bold")
        .fillColor("#8B6F47")
        .text("Studio 535", 50, 50);

      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#666666")
        .text("Bespoke Design & Precision Fabrication", 50, 85);

      // Invoice Title
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .fillColor("#000000")
        .text("INVOICE", 400, 50, { align: "right" });

      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#666666")
        .text(`Invoice #${data.invoiceNumber}`, 400, 75, { align: "right" });

      doc.text(`Date: ${formatDate(data.orderDate)}`, 400, 90, { align: "right" });

      // Divider line
      doc
        .strokeColor("#8B6F47")
        .lineWidth(2)
        .moveTo(50, 120)
        .lineTo(545, 120)
        .stroke();

      // Bill To Section
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#000000")
        .text("Bill To:", 50, 140);

      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#333333")
        .text(data.customerName, 50, 160)
        .text(data.customerEmail, 50, 175);

      // Items Table Header
      const tableTop = 220;
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor("#FFFFFF")
        .rect(50, tableTop, 495, 25)
        .fill("#8B6F47");

      doc
        .fillColor("#FFFFFF")
        .text("Item", 60, tableTop + 8)
        .text("Qty", 320, tableTop + 8, { width: 50, align: "center" })
        .text("Unit Price", 380, tableTop + 8, { width: 80, align: "right" })
        .text("Total", 470, tableTop + 8, { width: 65, align: "right" });

      // Items Table Rows
      let yPosition = tableTop + 35;
      doc.fillColor("#333333").font("Helvetica");

      data.items.forEach((item, index) => {
        // Alternate row background
        if (index % 2 === 0) {
          doc.rect(50, yPosition - 5, 495, 30).fill("#F9F9F9");
        }

        doc
          .fillColor("#333333")
          .fontSize(10)
          .text(item.name, 60, yPosition, { width: 240 })
          .fontSize(8)
          .fillColor("#666666")
          .text(item.description, 60, yPosition + 12, { width: 240 });

        doc
          .fontSize(10)
          .fillColor("#333333")
          .text(item.quantity.toString(), 320, yPosition, { width: 50, align: "center" })
          .text(`$${formatCurrency(item.unitPrice)}`, 380, yPosition, { width: 80, align: "right" })
          .text(`$${formatCurrency(item.total)}`, 470, yPosition, { width: 65, align: "right" });

        yPosition += 40;
      });

      // Totals Section
      yPosition += 20;
      const totalsX = 380;

      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#666666")
        .text("Subtotal:", totalsX, yPosition, { width: 80, align: "right" })
        .text(`$${formatCurrency(data.subtotal)}`, 470, yPosition, { width: 65, align: "right" });

      if (data.tax && data.tax > 0) {
        yPosition += 20;
        doc
          .text("Tax:", totalsX, yPosition, { width: 80, align: "right" })
          .text(`$${formatCurrency(data.tax)}`, 470, yPosition, { width: 65, align: "right" });
      }

      yPosition += 20;
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#000000")
        .text("Total:", totalsX, yPosition, { width: 80, align: "right" })
        .text(`$${formatCurrency(data.total)}`, 470, yPosition, { width: 65, align: "right" });

      // Payment Information
      yPosition += 40;
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor("#000000")
        .text("Payment Information", 50, yPosition);

      yPosition += 20;
      doc
        .font("Helvetica")
        .fillColor("#666666")
        .text(`Payment Method: ${data.paymentMethod}`, 50, yPosition);

      if (data.transactionId) {
        yPosition += 15;
        doc.text(`Transaction ID: ${data.transactionId}`, 50, yPosition);
      }

      // Footer
      const footerY = 750;
      doc
        .fontSize(8)
        .fillColor("#999999")
        .text("Thank you for your business!", 50, footerY, { align: "center", width: 495 })
        .text("Studio 535 - Bespoke Design & Precision Fabrication", 50, footerY + 15, {
          align: "center",
          width: 495,
        })
        .text(`Invoice generated on ${formatDate(new Date())}`, 50, footerY + 30, {
          align: "center",
          width: 495,
        });

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate unique invoice number
 */
export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `INV-${year}${month}-${random}`;
}

/**
 * Format currency (cents to dollars)
 */
function formatCurrency(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Format date as MM/DD/YYYY
 */
function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}
