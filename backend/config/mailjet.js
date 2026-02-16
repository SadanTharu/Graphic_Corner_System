const Mailjet = require('node-mailjet');

const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY || '',
  apiSecret: process.env.MAILJET_API_SECRET || '',
});

const sendEmail = async ({ to, toName, subject, htmlContent, textContent }) => {
  try {
    const fromEmail = process.env.MAILJET_FROM_EMAIL || 'noreply@graphiccorner.lk';
    console.log('📧 Sending email from:', fromEmail, 'to:', to);

    const result = await mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: fromEmail,
              Name: process.env.MAILJET_FROM_NAME || 'Graphic Corner',
            },
            To: [
              {
                Email: to,
                Name: toName || to,
              },
            ],
            Subject: subject,
            TextPart: textContent || '',
            HTMLPart: htmlContent,
          },
        ],
      });

    // Check per-message status — Mailjet returns 200 even if individual messages fail
    const messages = result.body?.Messages || [];
    const msg = messages[0];

    if (msg?.Status === 'error') {
      const errDetail = msg.Errors?.map(e => e.ErrorMessage).join(', ') || 'Unknown error';
      console.error('❌ Mailjet message error:', errDetail);
      console.error('❌ Full response:', JSON.stringify(messages, null, 2));
      return { success: false, error: errDetail };
    }

    console.log('✅ Email sent successfully to:', to, '| Status:', msg?.Status);
    return { success: true, data: result.body };
  } catch (error) {
    console.error('❌ Email send error:', error.statusCode || '', error.message);
    // Log full error detail from Mailjet
    if (error.response?.body) {
      console.error('❌ Mailjet error body:', JSON.stringify(error.response.body, null, 2));
    }
    return { success: false, error: error.message };
  }
};

const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #1a1a2e; border-radius: 12px; padding: 40px; text-align: center;">
        <h1 style="color: #E63946; margin-bottom: 10px;">Graphic Corner</h1>
        <h2 style="color: #ffffff; margin-bottom: 20px;">Password Reset Request</h2>
        <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6;">
          Hi <strong style="color: #fff;">${user.name}</strong>,
        </p>
        <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6;">
          We received a request to reset your password. Click the button below to set a new password:
        </p>
        <a href="${resetUrl}" 
           style="display: inline-block; background: #E63946; color: #ffffff; 
                  padding: 14px 32px; border-radius: 8px; text-decoration: none; 
                  font-weight: bold; font-size: 16px; margin: 20px 0;">
          Reset Password
        </a>
        <p style="color: #a0a0a0; font-size: 14px; margin-top: 20px;">
          This link will expire in <strong style="color: #fff;">1 hour</strong>.
        </p>
        <p style="color: #a0a0a0; font-size: 14px;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
        <hr style="border: 1px solid #333; margin: 30px 0;" />
        <p style="color: #666; font-size: 12px;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <a href="${resetUrl}" style="color: #E63946; word-break: break-all;">${resetUrl}</a>
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: user.email,
    toName: user.name,
    subject: 'Reset Your Password - Graphic Corner',
    htmlContent,
    textContent: `Hi ${user.name}, Reset your password using this link: ${resetUrl}. This link expires in 1 hour.`,
  });
};

// Email wrapper for styled notifications
const buildNotificationHtml = ({ title, greeting, bodyLines, ctaText, ctaUrl, footerText }) => {
  const ctaBlock = ctaText && ctaUrl ? `
    <a href="${ctaUrl}" 
       style="display: inline-block; background: #E63946; color: #ffffff; 
              padding: 14px 32px; border-radius: 8px; text-decoration: none; 
              font-weight: bold; font-size: 16px; margin: 20px 0;">
      ${ctaText}
    </a>` : '';

  const bodyHtml = bodyLines.map(line => 
    `<p style="color: #a0a0a0; font-size: 16px; line-height: 1.6;">${line}</p>`
  ).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #1a1a2e; border-radius: 12px; padding: 40px; text-align: center;">
        <h1 style="color: #E63946; margin-bottom: 10px;">Graphic Corner</h1>
        <h2 style="color: #ffffff; margin-bottom: 20px;">${title}</h2>
        <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6;">
          Hi <strong style="color: #fff;">${greeting}</strong>,
        </p>
        ${bodyHtml}
        ${ctaBlock}
        ${footerText ? `<p style="color: #666; font-size: 13px; margin-top: 20px;">${footerText}</p>` : ''}
        <hr style="border: 1px solid #333; margin: 30px 0;" />
        <p style="color: #666; font-size: 12px;">
          This is an automated notification from Graphic Corner.
        </p>
      </div>
    </div>
  `;
};

// Send task assignment email to team member
const sendTaskAssignedEmail = async (teamMember, taskTitle, orderInfo) => {
  const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/team/tasks`;
  const orderDetail = orderInfo ? ` for order <strong style="color: #fff;">${orderInfo}</strong>` : '';

  const htmlContent = buildNotificationHtml({
    title: 'New Task Assigned 📋',
    greeting: teamMember.name,
    bodyLines: [
      `You have been assigned a new task:`,
      `<strong style="color: #fff; font-size: 18px;">${taskTitle}</strong>${orderDetail}`,
      `Please log in to your dashboard to view the details and start working on it.`
    ],
    ctaText: 'View My Tasks',
    ctaUrl: dashboardUrl,
    footerText: 'Please complete the task before the due date.'
  });

  return sendEmail({
    to: teamMember.email,
    toName: teamMember.name,
    subject: `New Task Assigned: ${taskTitle} - Graphic Corner`,
    htmlContent,
    textContent: `Hi ${teamMember.name}, You have been assigned a new task: "${taskTitle}". Log in to your dashboard to view details: ${dashboardUrl}`,
  });
};

// Send task completed email to customer
const sendTaskCompletedEmail = async (customer, serviceName, orderNumber) => {
  const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/my-orders`;

  const htmlContent = buildNotificationHtml({
    title: 'Your Order is Complete! ✅',
    greeting: customer.name,
    bodyLines: [
      `Great news! Your order has been completed.`,
      `<strong style="color: #fff;">Service:</strong> ${serviceName}`,
      `<strong style="color: #fff;">Order:</strong> ${orderNumber}`,
      `Your final files are ready for download. Log in to your dashboard to view and download them.`
    ],
    ctaText: 'View My Orders',
    ctaUrl: dashboardUrl,
    footerText: 'Thank you for choosing Graphic Corner!'
  });

  return sendEmail({
    to: customer.email,
    toName: customer.name,
    subject: `Order ${orderNumber} Completed! - Graphic Corner`,
    htmlContent,
    textContent: `Hi ${customer.name}, Your order ${orderNumber} for ${serviceName} is complete! Log in to download your files: ${dashboardUrl}`,
  });
};

// Send order assigned email to team member (when assigned via order status update) 
const sendOrderAssignedEmail = async (teamMember, serviceName, orderNumber) => {
  const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/team/tasks`;

  const htmlContent = buildNotificationHtml({
    title: 'New Order Assigned 🚀',
    greeting: teamMember.name,
    bodyLines: [
      `You have been assigned to a new order:`,
      `<strong style="color: #fff;">Service:</strong> ${serviceName}`,
      `<strong style="color: #fff;">Order:</strong> ${orderNumber}`,
      `Please log in to your dashboard to start working on it.`
    ],
    ctaText: 'View Dashboard',
    ctaUrl: dashboardUrl,
    footerText: 'Deliver quality work on time!'
  });

  return sendEmail({
    to: teamMember.email,
    toName: teamMember.name,
    subject: `New Order Assigned: ${orderNumber} - Graphic Corner`,
    htmlContent,
    textContent: `Hi ${teamMember.name}, You have been assigned to order ${orderNumber} for ${serviceName}. Log in to start: ${dashboardUrl}`,
  });
};

module.exports = { sendEmail, sendPasswordResetEmail, sendTaskAssignedEmail, sendTaskCompletedEmail, sendOrderAssignedEmail };
