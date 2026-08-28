
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_LOGIN,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error('Email transporter verification failed:', error.message);
  } else {
    console.log('Email transporter ready');
  }
});



async function sendWelcomeEmail(to, name) {
  try {
    const response = await transporter.sendMail({
      from: { email:'hello@gadgetspot.com.ng', name: process.env.EMAIL_FROM_NAME || 'GadgetSpot' },
      to: [{ email: to, name: name }],
      subject: `Welcome to GadgetSpot, ${name}!`,
      htmlContent: `
        <div style="margin:0;padding:0;background-color:#eaf7ff;font-family:Arial,sans-serif;">
          <div style="max-width:620px;margin:0 auto;padding:24px;">
            <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(15, 76, 129, 0.12);">
              <div style="background:linear-gradient(135deg,#4da3ff,#7ec8ff);padding:28px 24px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:28px;">Welcome to GadgetSpot</h1>
                <p style="margin:8px 0 0;color:#fefefe;font-size:15px;">Your next favorite gadget experience starts here.</p>
              </div>
              <div style="padding:28px 24px;color:#244a66;">
                <h2 style="margin:0 0 12px;font-size:24px;color:#0f4c81;">Hi ${name},</h2>
                <p style="margin:0 0 16px;line-height:1.6;font-size:15px;">
                  Thanks for creating your GadgetSpot account. You're all set to explore premium gadgets, enjoy a smooth shopping experience, and discover amazing deals.
                </p>
                <div style="margin:24px 0;padding:14px 16px;border-left:4px solid #f5c542;background:#fff9e8;border-radius:8px;">
                  <p style="margin:0;color:#8a5d00;font-size:14px;">✨ Start browsing your favorite tech products today.</p>
                </div>
                <a href="https://gadgetspot.com.ng/products" style="display:inline-block;margin-top:12px;padding:12px 22px;background:#f5c542;color:#1f2b3a;text-decoration:none;border-radius:999px;font-weight:bold;">Shop Now</a>
              </div>
              <div style="padding:0 24px 24px;color:#6f8ba0;text-align:center;font-size:13px;">
                <div style="border-top:1px solid #e6f3fb;padding-top:16px;">
                  <p style="margin:0 0 6px;">GadgetSpot • Smart devices, made simple.</p>
                  <p style="margin:0;">Need help? Reply to this email and our team will be happy to assist.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
    });

    return { success: true, data: response };
  } catch (error) {
    console.error('Welcome email failed:', error.message || error);
    return { success: false, error: error.message || 'Unknown email error' };
  }
}

async function sendVerificationEmail(to, name, link) {
    if (!to || !name || !link) {
    return { success: false, error: 'sendVerificationEmail: "to", "name", and "link" are required' };
  }
  try {
    const response = await transporter.sendMail({
      from: { email: 'noreply@gadgetspot.com.ng', name: process.env.EMAIL_FROM_NAME || 'GadgetSpot' },
      to: [{ email: to, name: name }],
      subject: 'Verify your email',
      htmlContent: `
        <div style="margin:0;padding:0;background-color:#eaf7ff;font-family:Arial,sans-serif;">
          <div style="max-width:620px;margin:0 auto;padding:24px;">
            <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(15, 76, 129, 0.12);">
              <div style="background:linear-gradient(135deg,#4da3ff,#7ec8ff);padding:28px 24px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:28px;">Verify Your Email</h1>
              </div>
              <div style="padding:28px 24px;color:#244a66;">
                <h2 style="margin:0 0 12px;font-size:24px;color:#0f4c81;">Hi ${name},</h2>
                <p style="margin:0 0 16px;line-height:1.6;font-size:15px;">
                  Please confirm your email address to finish setting up your account and secure your GadgetSpot profile.
                </p>
                <div style="text-align:center;margin:24px 0;">
                  <a href="${link}" style="display:inline-block;padding:12px 24px;background:#f5c542;color:#1f2b3a;text-decoration:none;border-radius:999px;font-weight:bold;">Verify Email</a>
                </div>
                <p style="margin:0 0 8px;font-size:14px;color:#5a768d;">Or copy and paste this link into your browser:</p>
                <p style="margin:0;word-break:break-all;font-size:13px;color:#1f2b3a;">${link}</p>
                <p style="margin:16px 0 0;font-size:13px;color:#7a8fa3;">This link will expire in 24 hours.</p>
              </div>
              <div style="padding:0 24px 24px;color:#6f8ba0;text-align:center;font-size:13px;">
                <div style="border-top:1px solid #e6f3fb;padding-top:16px;">
                  <p style="margin:0 0 6px;">GadgetSpot • Secure your account with confidence.</p>
                  <p style="margin:0;">If you didn't create this account, you can ignore this message.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
    });

    return { success: true, data: response };
  } catch (error) {
    console.log('Verification email failed:', error.message || error);
    return { success: false, error: error.message || 'Unknown email error' };
  }
}

async function sendPasswordResetEmail(to, name, link) {
  
  if (!to || !name || !link) {
    return { success: false, error: 'sendPasswordResetEmail: "to", "name", and "link" are required' };
  }
  try {
    const response = await transporter.sendMail({
      from: { email: 'noreply@gadgetspot.com.ng', name: process.env.EMAIL_FROM_NAME || 'GadgetSpot' },
      to: [{ email: to, name: name }],
      subject: 'Reset your password',
      htmlContent: `
        <div style="margin:0;padding:0;background-color:#eaf7ff;font-family:Arial,sans-serif;">
          <div style="max-width:620px;margin:0 auto;padding:24px;">
            <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(15, 76, 129, 0.12);">
              <div style="background:linear-gradient(135deg,#4da3ff,#7ec8ff);padding:28px 24px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:28px;">Reset Your Password</h1>
              </div>
              <div style="padding:28px 24px;color:#244a66;">
                <h2 style="margin:0 0 12px;font-size:24px;color:#0f4c81;">Hi ${name},</h2>
                <p style="margin:0 0 16px;line-height:1.6;font-size:15px;">
                  We received a request to reset your password. Click the button below to create a new one.
                </p>
                <div style="text-align:center;margin:24px 0;">
                  <a href="${link}" style="display:inline-block;padding:12px 24px;background:#f5c542;color:#1f2b3a;text-decoration:none;border-radius:999px;font-weight:bold;">Reset Password</a>
                </div>
                <p style="margin:0 0 8px;font-size:14px;color:#5a768d;">Or copy and paste this link into your browser:</p>
                <p style="margin:0;word-break:break-all;font-size:13px;color:#1f2b3a;">${link}</p>
                <p style="margin:16px 0 0;font-size:13px;color:#7a8fa3;">If you didn't request this, you can safely ignore it. Your password will remain unchanged.</p>
              </div>
              <div style="padding:0 24px 24px;color:#6f8ba0;text-align:center;font-size:13px;">
                <div style="border-top:1px solid #e6f3fb;padding-top:16px;">
                  <p style="margin:0 0 6px;">GadgetSpot • Safe, simple password recovery.</p>
                  <p style="margin:0;">Need help? Contact support and we'll guide you through it.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
    });

    return { success: true, data: response };
  } catch (error) {
    console.error('Password reset email failed:', error.message || error);
    return { success: false, error: error.message || 'Unknown email error' };
  }
}

const SUPPORT_EMAIL =  'support@gadgetspot.com.ng';

async function sendContactEmail({ name, email, subject, message }) {
  if (!name || !email || !subject || !message) {
    return { success: false, error: 'sendContactEmail: "name", "email", "subject", and "message" are required' };
  }

  try {
    const response = await transporter.sendMail({
      from: { email: 'noreply@gadgetspot.com.ng', name: process.env.EMAIL_FROM_NAME || 'GadgetSpot' },
      to: [{ email: SUPPORT_EMAIL }],
      replyTo: { email: email, name: name },
      subject: `Contact: ${subject}`,
      htmlContent: `
        <div style="margin:0;padding:0;background-color:#eaf7ff;font-family:Arial,sans-serif;">
          <div style="max-width:620px;margin:0 auto;padding:24px;">
            <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(15, 76, 129, 0.12);">
              <div style="background:linear-gradient(135deg,#4da3ff,#7ec8ff);padding:24px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:24px;">New Contact Message</h1>
                <p style="margin:6px 0 0;color:#fefefe;font-size:14px;">You received a new message from the GadgetSpot contact form.</p>
              </div>
              <div style="padding:24px;color:#244a66;">
                <p style="margin:0 0 12px;font-size:15px;"><strong>From:</strong> ${name} &lt;${email}&gt;</p>
                <p style="margin:0 0 16px;font-size:15px;"><strong>Subject:</strong> ${subject}</p>
                <div style="background:#f4faff;border-left:4px solid #4da3ff;border-radius:8px;padding:14px 16px;font-size:15px;line-height:1.6;white-space:pre-wrap;">${message}</div>
                <p style="margin:20px 0 0;font-size:13px;color:#7a8fa3;">Reply directly to ${email} to respond to this inquiry.</p>
              </div>
            </div>
          </div>
        </div>
      `,
    });

    return { success: true, data: response };
  } catch (error) {
    console.error('Contact email failed:', error.message || error);
    return { success: false, error: error.message || 'Unknown email error' };
  }
}

async function sendOrderConfirmationEmail({ to, name, order }) {
 
  if (!to || !name || !order) {
    return { success: false, error: 'sendOrderConfirmationEmail: "to", "name", and "order" are required' };
  }

  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#1e293b;">
          ${item.name}${item.color ? ` <span style="color:#64748b;font-size:11px;">(${item.color})</span>` : ''}
          <br/><span style="color:#64748b;font-size:11px;">Qty: ${item.quantity}</span>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#1e293b;text-align:right;">₦${Number(item.price).toLocaleString()}</td>
      </tr>
    `
    )
    .join('');

  try {
    const response = await transporter.sendMail({
      from: { email: 'order@gadgetspot.com.ng', name: process.env.EMAIL_FROM_NAME || 'GadgetSpot' },
      to: [{ email: to, name: name }],
      subject: `Order Confirmation - ${order.reference || 'GadgetSpot'}`,
      htmlContent: `
        <div style="margin:0;padding:0;background-color:#eaf7ff;font-family:Arial,sans-serif;">
          <div style="max-width:620px;margin:0 auto;padding:24px;">
            <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(15, 76, 129, 0.12);">
              <div style="background:linear-gradient(135deg,#4da3ff,#7ec8ff);padding:28px 24px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:28px;">Order Confirmed!</h1>
                <p style="margin:8px 0 0;color:#fefefe;font-size:15px;">Thank you for shopping with GadgetSpot.</p>
              </div>
              <div style="padding:28px 24px;color:#244a66;">
                <h2 style="margin:0 0 12px;font-size:24px;color:#0f4c81;">Hi ${name},</h2>
                <p style="margin:0 0 16px;line-height:1.6;font-size:15px;">
                  Your order has been received and is being processed. Here are your order details:
                </p>

                <div style="background:#f8fafc;border-radius:12px;padding:16px;margin-bottom:20px;">
                  <p style="margin:0 0 8px;font-size:14px;color:#475569;"><strong>Order Reference:</strong> ${order.reference || '—'}</p>
                  <p style="margin:0 0 8px;font-size:14px;color:#475569;"><strong>Status:</strong> <span style="text-transform:capitalize;">${order.status || 'paid'}</span></p>
                  <p style="margin:0;font-size:14px;color:#475569;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                </div>

                <h3 style="margin:0 0 12px;font-size:16px;color:#0f4c81;">Order Summary</h3>
                <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
                  <thead>
                    <tr style="background:#f1f5f9;">
                      <th style="padding:10px 12px;text-align:left;font-size:11px;color:#475569;text-transform:uppercase;font-weight:600;">Item</th>
                      <th style="padding:10px 12px;text-align:right;font-size:11px;color:#475569;text-transform:uppercase;font-weight:600;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>

                <div style="background:#f8fafc;border-radius:12px;padding:16px;margin-bottom:20px;">
                  <div style="display:flex;justify-content:space-between;font-size:14px;color:#475569;margin-bottom:8px;">
                    <span>Subtotal</span>
                    <span>₦${Number(order.subtotal || 0).toLocaleString()}</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;font-size:14px;color:#475569;margin-bottom:8px;">
                    <span>Delivery Fee</span>
                    <span>₦${Number(order.deliveryFee || 0).toLocaleString()}</span>
                  </div>
                  <div style="border-top:1px solid #e2e8f0;padding-top:8px;display:flex;justify-content:space-between;font-size:16px;color:#0f4c81;font-weight:bold;">
                    <span>Total Paid</span>
                    <span>₦${Number(order.total || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div style="background:#f8fafc;border-radius:12px;padding:16px;margin-bottom:20px;">
                  <p style="margin:0 0 8px;font-size:14px;color:#475569;"><strong>Shipping Address:</strong></p>
                  <p style="margin:0;font-size:14px;color:#1e293b;">${order.shippingAddress || order.address?.line1 || '—'}</p>
                  <p style="margin:4px 0 0;font-size:14px;color:#1e293b;">${order.address?.state || ''} ${order.address?.lga ? ', ' + order.address.lga : ''}</p>
                </div>

                <div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:8px;padding:14px 16px;margin-bottom:20px;">
                  <p style="margin:0;color:#15803d;font-size:14px;">✅ Your payment has been confirmed. We'll notify you when your order ships.</p>
                </div>

                <p style="margin:0;font-size:13px;color:#64748b;">If you have any questions, contact our support team.</p>
              </div>
              <div style="padding:0 24px 24px;color:#6f8ba0;text-align:center;font-size:13px;">
                <div style="border-top:1px solid #e6f3fb;padding-top:16px;">
                  <p style="margin:0 0 6px;">GadgetSpot • Smart devices, made simple.</p>
                  <p style="margin:0;">Need help? Reply to this email and our team will be happy to assist.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
    });

    return { success: true, data: response };
  } catch (error) {
    console.error('Order confirmation email failed:', error.message || error);
    return { success: false, error: error.message || 'Unknown email error' };
  }
}

async function sendOrderStatusUpdateEmail({ to, name, order }) {
  if (!to || !name || !order) {
    return { success: false, error: 'sendOrderStatusUpdateEmail: "to", "name", and "order" are required' };
  }
  const statusLabel = String(order.status || '').charAt(0).toUpperCase() + String(order.status || '').slice(1);

  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#1e293b;">
          ${item.name}${item.color ? ` <span style="color:#64748b;font-size:11px;">(${item.color})</span>` : ''}
          <br/><span style="color:#64748b;font-size:11px;">Qty: ${item.quantity}</span>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#1e293b;text-align:right;">₦${Number(item.price).toLocaleString()}</td>
      </tr>
    `
    )
    .join('');

  try {
    const response = await transporter.sendMail ({
      from: { email: 'order@gadgetspot.com.ng', name: process.env.EMAIL_FROM_NAME || 'GadgetSpot' },
      to: [{ email: to, name: name }],
      subject: `Order Status Updated - ${order.reference || 'GadgetSpot'}`,
      htmlContent: `
        <div style="margin:0;padding:0;background-color:#eaf7ff;font-family:Arial,sans-serif;">
          <div style="max-width:620px;margin:0 auto;padding:24px;">
            <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(15, 76, 129, 0.12);">
              <div style="background:linear-gradient(135deg,#4da3ff,#7ec8ff);padding:28px 24px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:28px;">Order Status Updated</h1>
                <p style="margin:8px 0 0;color:#fefefe;font-size:15px;">Your order status has been changed to <strong>${statusLabel}</strong></p>
              </div>
              <div style="padding:28px 24px;color:#244a66;">
                <h2 style="margin:0 0 12px;font-size:24px;color:#0f4c81;">Hi ${name},</h2>
                <p style="margin:0 0 16px;line-height:1.6;font-size:15px;">
                  We wanted to let you know that your order status has been updated. Here are the details:
                </p>

                <div style="background:#f8fafc;border-radius:12px;padding:16px;margin-bottom:20px;">
                  <p style="margin:0 0 8px;font-size:14px;color:#475569;"><strong>Order Reference:</strong> ${order.reference || '—'}</p>
                  <p style="margin:0 0 8px;font-size:14px;color:#475569;"><strong>New Status:</strong> <span style="text-transform:capitalize;font-weight:bold;">${statusLabel}</span></p>
                  <p style="margin:0;font-size:14px;color:#475569;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                </div>

                <h3 style="margin:0 0 12px;font-size:16px;color:#0f4c81;">Order Summary</h3>
                <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
                  <thead>
                    <tr style="background:#f1f5f9;">
                      <th style="padding:10px 12px;text-align:left;font-size:11px;color:#475569;text-transform:uppercase;font-weight:600;">Item</th>
                      <th style="padding:10px 12px;text-align:right;font-size:11px;color:#475569;text-transform:uppercase;font-weight:600;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>

                <div style="background:#f8fafc;border-radius:12px;padding:16px;margin-bottom:20px;">
                  <div style="display:flex;justify-content:space-between;font-size:14px;color:#475569;margin-bottom:8px;">
                    <span>Subtotal</span>
                    <span>₦${Number(order.subtotal || 0).toLocaleString()}</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;font-size:14px;color:#475569;margin-bottom:8px;">
                    <span>Delivery Fee</span>
                    <span>₦${Number(order.deliveryFee || 0).toLocaleString()}</span>
                  </div>
                  <div style="border-top:1px solid #e2e8f0;padding-top:8px;display:flex;justify-content:space-between;font-size:16px;color:#0f4c81;font-weight:bold;">
                    <span>Total</span>
                    <span>₦${Number(order.total || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div style="background:#f8fafc;border-radius:12px;padding:16px;margin-bottom:20px;">
                  <p style="margin:0 0 8px;font-size:14px;color:#475569;"><strong>Shipping Address:</strong></p>
                  <p style="margin:0;font-size:14px;color:#1e293b;">${order.shippingAddress || order.address?.line1 || '—'}</p>
                  <p style="margin:4px 0 0;font-size:14px;color:#1e293b;">${order.address?.state || ''} ${order.address?.lga ? ', ' + order.address.lga : ''}</p>
                </div>

                <p style="margin:0;font-size:13px;color:#64748b;">If you have any questions, contact our support team.</p>
              </div>
              <div style="padding:0 24px 24px;color:#6f8ba0;text-align:center;font-size:13px;">
                <div style="border-top:1px solid #e6f3fb;padding-top:16px;">
                  <p style="margin:0 0 6px;">GadgetSpot • Smart devices, made simple.</p>
                  <p style="margin:0;">Need help? Reply to this email and our team will be happy to assist.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
    });

    return { success: true, data: response };
  } catch (error) {
    console.error('Order status update email failed:', error.message || error);
    return { success: false, error: error.message || 'Unknown email error' };
  }
}

module.exports = { sendWelcomeEmail, sendVerificationEmail, sendPasswordResetEmail, sendContactEmail, sendOrderConfirmationEmail, sendOrderStatusUpdateEmail };
