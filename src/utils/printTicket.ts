import { format } from 'date-fns';
import { Order } from '@/types/order';

export const printOrderTicket = (order: Order) => {
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Please allow popups to print tickets');
    return;
  }

  const createdDate = new Date(order.created_at || new Date());
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Ticket #${order.order_number}</title>
      <style>
        body {
          font-family: 'Courier New', Courier, monospace;
          width: 80mm; /* Standard receipt width */
          margin: 0;
          padding: 10px;
          color: #000;
        }
        .header {
          text-align: center;
          border-bottom: 2px dashed #000;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .title {
          font-size: 1.2em;
          font-weight: bold;
          margin: 5px 0;
        }
        .meta {
          font-size: 0.9em;
          margin-bottom: 5px;
        }
        .section {
          margin-bottom: 15px;
          border-bottom: 1px solid #000;
          padding-bottom: 10px;
        }
        .item-title {
          font-weight: bold;
          font-size: 1.1em;
          margin-bottom: 5px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
        }
        .label {
          font-weight: bold;
        }
        .large-text {
          font-size: 1.3em;
          font-weight: bold;
          display: block;
          margin: 5px 0;
        }
        .footer {
          text-align: center;
          font-size: 0.8em;
          margin-top: 20px;
          border-top: 2px dashed #000;
          padding-top: 10px;
        }
        @media print {
          body { width: 100%; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">ELI'S DULCE TRADICIÓN</div>
        <div>Kitchen Ticket</div>
        <div class="meta">#${order.order_number}</div>
        <div class="meta">${format(createdDate, 'MM/dd/yyyy HH:mm')}</div>
      </div>

      <div class="section">
        <div class="label">DUE DATE:</div>
        <div class="large-text">${order.date_needed}</div>
        <div class="large-text">${order.time_needed}</div>
      </div>

      <div class="section">
        <div class="item-title">CAKE DETAILS</div>
        <div class="detail-row">
          <span class="label">Size:</span>
          <span>${order.cake_size}</span>
        </div>
        <div class="detail-row">
          <span class="label">Filling:</span>
          <span>${order.filling}</span>
        </div>
      </div>

      <div class="section">
        <div class="item-title">DESIGN</div>
        <div>${order.theme}</div>
        ${order.dedication ? `<div style="margin-top:5px; font-style:italic;">"${order.dedication}"</div>` : ''}
      </div>

      <div class="section">
        <div class="item-title">CUSTOMER</div>
        <div>${order.customer_name}</div>
        <div>${order.customer_phone}</div>
        <div style="margin-top:5px; font-weight:bold;">${order.delivery_option === 'delivery' ? 'DELIVERY' : 'PICKUP'}</div>
      </div>

      <div class="footer">
        Printed: ${format(new Date(), 'MM/dd/yyyy HH:mm:ss')}
      </div>

      <script>
        window.onload = function() {
          window.print();
          // Optional: close after print
          // window.onafterprint = function() { window.close(); }
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

