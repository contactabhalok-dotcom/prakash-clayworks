/**
 * Email service using Resend API
 * Sends transactional emails for order notifications
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'Prakash Clayworks <onboarding@resend.dev>';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  items: Array<{
    title: { en: string; hi: string };
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  paymentStatus: string;
}

// Email HTML template builder
function createOrderEmailTemplate(
  subject: string,
  orderData: OrderEmailData,
  statusMessage: string,
  statusColor: string = '#c65d3e'
): string {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f0eb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f0eb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: ${statusColor}; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                Prakash Clayworks
              </h1>
            </td>
          </tr>

          <!-- Status Message -->
          <tr>
            <td style="padding: 30px 40px 20px; text-align: center;">
              <h2 style="margin: 0 0 10px; color: ${statusColor}; font-size: 24px; font-weight: 600;">
                ${subject}
              </h2>
              <p style="margin: 0; color: #666666; font-size: 16px; line-height: 1.5;">
                ${statusMessage}
              </p>
            </td>
          </tr>

          <!-- Order Details -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <tr style="background-color: #f9f9f9;">
                  <td style="padding: 15px 20px;">
                    <strong style="color: #666666; font-size: 14px;">Order Number</strong>
                    <p style="margin: 5px 0 0; color: ${statusColor}; font-size: 18px; font-weight: 600; font-family: monospace;">
                      ${orderData.orderNumber}
                    </p>
                  </td>
                  <td style="padding: 15px 20px; text-align: right;">
                    <strong style="color: #666666; font-size: 14px;">Total Amount</strong>
                    <p style="margin: 5px 0 0; color: #333333; font-size: 18px; font-weight: 600;">
                      ${formatPrice(orderData.total)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Items -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h3 style="margin: 0 0 15px; color: #333333; font-size: 18px; font-weight: 600;">
                Order Items
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${orderData.items.map((item, index) => `
                <tr${index % 2 === 0 ? ' style="background-color: #f9f9f9;"' : ''}>
                  <td style="padding: 12px 20px;">
                    <strong style="color: #333333; font-size: 15px;">${item.title.en}</strong>
                    <p style="margin: 3px 0 0; color: #666666; font-size: 14px;">
                      Qty: ${item.quantity} × ${formatPrice(item.price)}
                    </p>
                  </td>
                  <td style="padding: 12px 20px; text-align: right; color: #333333; font-size: 15px; font-weight: 500;">
                    ${formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
                `).join('')}
              </table>
            </td>
          </tr>

          <!-- Shipping Address -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 8px; padding: 20px;">
                <tr>
                  <td>
                    <h4 style="margin: 0 0 10px; color: #666666; font-size: 14px; font-weight: 600; text-transform: uppercase;">
                      Shipping Address
                    </h4>
                    <p style="margin: 0 0 5px; color: #333333; font-size: 15px; font-weight: 500;">
                      ${orderData.shippingAddress.name}
                    </p>
                    <p style="margin: 0 0 5px; color: #666666; font-size: 14px; line-height: 1.5;">
                      ${orderData.shippingAddress.address}
                    </p>
                    <p style="margin: 0 0 5px; color: #666666; font-size: 14px;">
                      ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} - ${orderData.shippingAddress.pincode}
                    </p>
                    <p style="margin: 5px 0 0; color: #666666; font-size: 14px;">
                      Phone: ${orderData.shippingAddress.phone}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Payment Info -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 10px 0;">
                    <strong style="color: #666666; font-size: 14px;">Payment Method:</strong>
                    <span style="color: #333333; font-size: 15px; margin-left: 10px;">
                      ${orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <strong style="color: #666666; font-size: 14px;">Payment Status:</strong>
                    <span style="margin-left: 10px; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 500;
                      ${orderData.paymentStatus === 'paid' 
                        ? 'background-color: #d4edda; color: #155724;' 
                        : 'background-color: #fff3cd; color: #856404;'}">
                      ${orderData.paymentStatus === 'paid' ? 'Paid' : orderData.paymentStatus === 'pending' ? 'Pending' : 'Failed'}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
              <a href="${BASE_URL}/orders/${orderData.orderNumber}" 
                 style="display: inline-block; padding: 14px 40px; background-color: ${statusColor}; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">
                View Order Details
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px; color: #666666; font-size: 14px; line-height: 1.5;">
                Need help? Contact us on WhatsApp:<br>
                <a href="https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210'}" 
                   style="color: ${statusColor}; text-decoration: none; font-weight: 500;">
                  ${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+91 98765 43210'}
                </a>
              </p>
              <p style="margin: 15px 0 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} Prakash Clayworks. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Send email function
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured. Email not sent.');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to send email:', error);
      return false;
    }

    console.log('Email sent successfully to:', to);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Email notification handlers
export async function sendOrderConfirmationEmail(orderData: OrderEmailData): Promise<boolean> {
  const subject = `Order Confirmed! - ${orderData.orderNumber}`;
  const statusMessage = `Thank you ${orderData.customerName}! Your order has been successfully placed and confirmed.`;
  
  const html = createOrderEmailTemplate(
    subject,
    orderData,
    statusMessage,
    '#c65d3e' // terracotta color
  );

  return sendEmail(orderData.customerEmail, subject, html);
}

export async function sendOrderPlacedEmail(orderData: OrderEmailData): Promise<boolean> {
  const subject = `Order Received - ${orderData.orderNumber}`;
  const statusMessage = `Thank you ${orderData.customerName}! We've received your order and will process it shortly.`;
  
  const html = createOrderEmailTemplate(
    subject,
    orderData,
    statusMessage,
    '#c65d3e'
  );

  return sendEmail(orderData.customerEmail, subject, html);
}

export async function sendOrderShippedEmail(orderData: OrderEmailData): Promise<boolean> {
  const subject = `Your Order is on the Way! - ${orderData.orderNumber}`;
  const statusMessage = `Great news ${orderData.customerName}! Your order has been shipped and is on its way to you.`;
  
  const html = createOrderEmailTemplate(
    subject,
    orderData,
    statusMessage,
    '#2196F3' // blue color for shipped
  );

  return sendEmail(orderData.customerEmail, subject, html);
}

export async function sendOrderDeliveredEmail(orderData: OrderEmailData): Promise<boolean> {
  const subject = `Order Delivered! - ${orderData.orderNumber}`;
  const statusMessage = `Your order has been successfully delivered! We hope you're happy with your purchase.`;
  
  const html = createOrderEmailTemplate(
    subject,
    orderData,
    statusMessage,
    '#4CAF50' // green color for delivered
  );

  return sendEmail(orderData.customerEmail, subject, html);
}

export async function sendOrderCancelledEmail(orderData: OrderEmailData): Promise<boolean> {
  const subject = `Order Cancelled - ${orderData.orderNumber}`;
  const statusMessage = `Your order has been cancelled. If you have any questions, please contact us.`;
  
  const html = createOrderEmailTemplate(
    subject,
    orderData,
    statusMessage,
    '#f44336' // red color for cancelled
  );

  return sendEmail(orderData.customerEmail, subject, html);
}
