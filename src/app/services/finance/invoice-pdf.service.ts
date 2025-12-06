import { Injectable } from '@angular/core';
import { InvoiceDto } from '../../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoicePdfService {

  // In hóa đơn đã thanh toán
  printInvoice(invoice: InvoiceDto): void {
    if (invoice.status !== 'PAID') {
      throw new Error('Chỉ có thể in hóa đơn đã thanh toán');
    }

    const htmlContent = this.generateInvoiceHTML(invoice);
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      throw new Error('Không thể mở cửa sổ in. Vui lòng kiểm tra cài đặt trình chặn popup.');
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  }

  // Loại bỏ tất cả whitespace ở đầu/cuối
  private trimAll(text: string): string {
    if (!text || typeof text !== 'string') return '';
    return text.replace(/^[\s\u00A0\u2000-\u200B\u2028\u2029\u3000]+|[\s\u00A0\u2000-\u200B\u2028\u2029\u3000]+$/g, '');
  }

  // Parse description từ JSON string (backend serialize bằng JsonSerializer)
  private parseDescription(description: string): string {
    if (!description) return 'Phí dịch vụ chung cư';

    const trimmed = this.trimAll(description);

    try {
      const parsed = JSON.parse(trimmed);
      
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        if (parsed.itemDescription && typeof parsed.itemDescription === 'string') {
          let itemDesc = parsed.itemDescription.trim();
          itemDesc = itemDesc.replace(/[\s\u00A0\u2000-\u200B\u2028\u2029\u3000]+$/g, '');
          itemDesc = itemDesc.replace(/[\s\u00A0\u2000-\u200B\u2028\u2029\u3000]+/g, ' ');
          itemDesc = itemDesc.trim();
          
          if (parsed.note && typeof parsed.note === 'string' && parsed.note.trim()) {
            let note = parsed.note.trim();
            note = note.replace(/[\s\u00A0\u2000-\u200B\u2028\u2029\u3000]+$/g, '');
            note = note.replace(/[\s\u00A0\u2000-\u200B\u2028\u2029\u3000]+/g, ' ');
            note = note.trim();
            if (note) return itemDesc + '. ' + note;
          }
          
          return itemDesc || 'Phí dịch vụ chung cư';
        }
      }
    } catch (e) {
      // Không phải JSON, xử lý như text đơn giản
      let result = this.trimAll(trimmed);
      result = result.replace(/[\s\u00A0\u2000-\u200B\u2028\u2029\u3000]+/g, ' ');
      return result.trim() || 'Phí dịch vụ chung cư';
    }

    return 'Phí dịch vụ chung cư';
  }

  // Format date theo định dạng Việt Nam
  private formatDate(dateString: string): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('vi-VN');
    } catch {
      return '-';
    }
  }

  // Format số tiền theo định dạng VND
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  // Escape HTML để tránh XSS
  private escapeHtml(text: string): string {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Tạo HTML cho hóa đơn
  private generateInvoiceHTML(invoice: InvoiceDto): string {
    const description = this.parseDescription(invoice.description);
    const startDate = this.formatDate(invoice.startDate);
    const endDate = this.formatDate(invoice.endDate);
    const createdDate = this.formatDate(invoice.createdAt);
    const paidDate = this.formatDate(invoice.updatedAt);
    const dueDate = this.formatDate(invoice.endDate);
    const price = this.formatCurrency(invoice.price);
    
    const invoiceId = this.escapeHtml(invoice.invoiceId);
    const apartmentCode = this.escapeHtml(invoice.apartmentCode || 'N/A');
    const residentName = this.escapeHtml(invoice.residentName || 'N/A');
    const feeType = this.escapeHtml(invoice.feeType || 'N/A');
    const descriptionEscaped = this.escapeHtml(description);

    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hóa đơn ${invoiceId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 40px;
      color: #333;
      background: #fff;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #2563eb;
      font-size: 28px;
      margin-bottom: 10px;
    }
    .header p {
      color: #666;
      font-size: 14px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
    }
    .info-section h3 {
      color: #2563eb;
      font-size: 16px;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
    .info-row {
      margin-bottom: 8px;
      font-size: 14px;
    }
    .info-label {
      font-weight: 600;
      color: #555;
      display: inline-block;
      width: 140px;
    }
    .info-value {
      color: #333;
    }
    .details {
      margin-bottom: 30px;
    }
    .details h3 {
      color: #2563eb;
      font-size: 18px;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background-color: #f3f4f6;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border: 1px solid #e5e7eb;
    }
    td {
      padding: 12px;
      border: 1px solid #e5e7eb;
      color: #333;
    }
    .total {
      text-align: right;
      margin-top: 20px;
      padding: 20px;
      background-color: #f9fafb;
      border-radius: 8px;
    }
    .total-row {
      display: flex;
      justify-content: flex-end;
      font-size: 16px;
    }
    .total-label {
      font-weight: 600;
      color: #555;
      margin-right: 20px;
      min-width: 150px;
    }
    .total-value {
      font-weight: 700;
      color: #2563eb;
      font-size: 20px;
    }
    .badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 12px;
      background-color: #10b981;
      color: #fff;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    @media print {
      body { padding: 20px; }
      .container { max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>HÓA ĐƠN THANH TOÁN</h1>
      <p>Hệ thống quản lý chung cư</p>
    </div>

    <div class="info-grid">
      <div class="info-section">
        <h3>Thông tin hóa đơn</h3>
        <div class="info-row">
          <span class="info-label">Mã hóa đơn:</span>
          <span class="info-value">${invoiceId}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Từ ngày:</span>
          <span class="info-value">${startDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Đến ngày:</span>
          <span class="info-value">${endDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Ngày tạo:</span>
          <span class="info-value">${createdDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Ngày thanh toán:</span>
          <span class="info-value">${paidDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Trạng thái:</span>
          <span class="info-value"><span class="badge">Đã thanh toán</span></span>
        </div>
      </div>

      <div class="info-section">
        <h3>Thông tin căn hộ</h3>
        <div class="info-row">
          <span class="info-label">Mã căn hộ:</span>
          <span class="info-value">${apartmentCode}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Cư dân:</span>
          <span class="info-value">${residentName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Loại phí:</span>
          <span class="info-value">${feeType}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Ngày đến hạn:</span>
          <span class="info-value">${dueDate}</span>
        </div>
      </div>
    </div>

    <div class="details">
      <h3>Chi tiết hóa đơn</h3>
      <table>
        <thead>
          <tr>
            <th style="width: 50%;">Mô tả</th>
            <th style="width: 50%; text-align: right;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${descriptionEscaped}</td>
            <td style="text-align: right;">${price}</td>
          </tr>
        </tbody>
      </table>

      <div class="total">
        <div class="total-row">
          <span class="total-label">Tổng cộng:</span>
          <span class="total-value">${price}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Cảm ơn quý khách đã sử dụng dịch vụ!</p>
      <p>Hóa đơn này có giá trị pháp lý và được lưu trữ trong hệ thống.</p>
    </div>
  </div>
</body>
</html>`;
  }
}
