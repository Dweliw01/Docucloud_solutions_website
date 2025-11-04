// Email service - handles email notifications
const sgMail = require('../config/email');
const config = require('../config');

class EmailService {
  // Send notification to admin
  async sendAdminNotification(inquiry) {
    const msg = {
      to: config.email.notificationEmail,
      from: config.email.from,
      subject: `New Inquiry: ${inquiry.name}${inquiry.company ? ` from ${inquiry.company}` : ''}`,
      html: this.getAdminEmailTemplate(inquiry)
    };

    try {
      await sgMail.send(msg);
      console.log(`Admin notification sent for inquiry ${inquiry.id}`);
    } catch (error) {
      console.error('Admin email error:', error);
      throw error;
    }
  }

  // Send confirmation to customer
  async sendCustomerConfirmation(inquiry) {
    const msg = {
      to: inquiry.email,
      from: config.email.from,
      subject: 'Thanks for reaching out to DocuCloud Solutions!',
      html: this.getCustomerEmailTemplate(inquiry)
    };

    try {
      await sgMail.send(msg);
      console.log(`Confirmation sent to ${inquiry.email}`);
    } catch (error) {
      console.error('Customer email error:', error);
      throw error;
    }
  }

  // Admin email template
  getAdminEmailTemplate(inquiry) {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 30px; text-align: center;">
          <!-- Add your logo here once it's hosted publicly -->
          <!-- <img src="https://yourdomain.com/images/DocuCloud_Solutions_Logo_Design.png" alt="DocuCloud Solutions" style="height: 60px; margin-bottom: 20px;"> -->
          <h1 style="color: white; margin: 0;">New Inquiry Received</h1>
        </div>

        <div style="padding: 30px; background: #f8fafc;">
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <h2 style="margin-top: 0; color: #1e293b;">Contact Information</h2>

            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold; width: 30%;">Name:</td>
                <td style="padding: 10px;">${inquiry.name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold;">Email:</td>
                <td style="padding: 10px;"><a href="mailto:${inquiry.email}" style="color: #2563eb;">${inquiry.email}</a></td>
              </tr>
              ${inquiry.phone ? `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold;">Phone:</td>
                <td style="padding: 10px;"><a href="tel:${inquiry.phone}" style="color: #2563eb;">${inquiry.phone}</a></td>
              </tr>
              ` : ''}
              ${inquiry.company ? `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold;">Company:</td>
                <td style="padding: 10px;">${inquiry.company}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 10px; font-weight: bold;">Source:</td>
                <td style="padding: 10px;">${inquiry.source || 'website'}</td>
              </tr>
            </table>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <h3 style="margin-top: 0; color: #1e293b;">Message:</h3>
            <p style="color: #64748b; line-height: 1.6; white-space: pre-wrap;">${inquiry.message}</p>
          </div>
        </div>

        <div style="padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
          <p>DocuCloud Solutions | Automated Inquiry Notification</p>
        </div>
      </body>
      </html>
    `;
  }

  // Customer confirmation template
  getCustomerEmailTemplate(inquiry) {
    const firstName = inquiry.name.split(' ')[0];

    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Thank You, ${firstName}!</h1>
        </div>

        <div style="padding: 30px; background: #f8fafc;">
          <p style="font-size: 16px; line-height: 1.6; color: #475569;">
            We received your inquiry and appreciate you reaching out to DocuCloud Solutions.
          </p>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">What happens next?</h3>
            <ul style="color: #64748b; line-height: 1.8;">
              <li>We'll review your inquiry within the next few hours</li>
              <li>A team member will contact you within 24 hours</li>
              <li>We'll schedule your free 15-minute automation consultation</li>
              <li>You'll receive a customized automation strategy</li>
            </ul>
          </div>

          <p style="font-size: 16px; line-height: 1.6; color: #475569;">
            In the meantime, feel free to explore our case studies to see how we've helped businesses save 10-30 hours per week.
          </p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px;">
              Best regards,<br>
              <strong style="color: #1e293b;">The DocuCloud Solutions Team</strong>
            </p>
          </div>
        </div>

        <div style="padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
          <p>DocuCloud Solutions LLC<br>
          Based in New York City | Serving businesses nationwide<br>
          <a href="https://docucloudsolutions.com" style="color: #2563eb;">docucloudsolutions.com</a></p>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
