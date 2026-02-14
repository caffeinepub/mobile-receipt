export async function generateBillPdf(billData: any, settings: any): Promise<Blob> {
  // This is a simplified implementation
  // In a real app, you'd use a library like jsPDF or pdfmake
  
  // Helper function to escape HTML special characters
  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };
  
  const content = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { max-width: 100px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { text-align: right; font-size: 18px; font-weight: bold; margin: 20px 0; }
          .qr { text-align: center; margin-top: 30px; }
          .qr img { max-width: 150px; }
        </style>
      </head>
      <body>
        <div class="header">
          ${settings.companyLogo ? `<img src="${settings.companyLogo}" class="logo" />` : ''}
          <h1>${escapeHtml(settings.companyName || 'Company Name')}</h1>
          <p>${escapeHtml(settings.companyAddress || '')}</p>
          <p>${escapeHtml(settings.companyPhone || '')}</p>
        </div>
        
        <div>
          <p><strong>Bill No:</strong> ${escapeHtml(billData.billNumber)}</p>
          <p><strong>Date:</strong> ${new Date(billData.date).toLocaleDateString()}</p>
          <p><strong>Customer:</strong> ${escapeHtml(billData.customerName)}</p>
          ${billData.phone ? `<p><strong>Phone:</strong> ${escapeHtml(billData.phone)}</p>` : ''}
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Sl.</th>
              <th>Description</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Disc %</th>
              <th>GST %</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${billData.items.map((item: any, index: number) => `
              <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(item.description)}</td>
                <td>₹${item.basePrice.toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td>${item.discount}%</td>
                <td>${item.gst}%</td>
                <td>₹${item.totalPrice.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total">
          Grand Total: ₹${billData.totalAmount.toFixed(2)}
        </div>
        
        <div class="qr">
          <p><strong>Scan to Pay</strong></p>
          <img src="${settings.paymentQr || '/assets/generated/default-payment-qr.dim_512x512.png'}" />
          <p style="margin-top: 20px; font-size: 18px;"><strong>Thank you for your business!</strong></p>
        </div>
      </body>
    </html>
  `;

  const blob = new Blob([content], { type: 'text/html' });
  return blob;
}
