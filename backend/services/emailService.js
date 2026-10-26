import nodemailer from 'nodemailer';

let transporter = null;
let etherealAccount = null;

/**
 * Initialize or get the cached nodemailer transporter.
 * If SMTP credentials are provided in process.env, uses those.
 * Otherwise, falls back to an Ethereal test account or JSON stream transporter.
 */
const getTransporter = async () => {
  if (transporter) {
    return transporter;
  }

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
    SMTP_SERVICE
  } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: SMTP_SECURE === 'true' || Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
    console.log(`[EmailService] Configured custom SMTP transporter (${SMTP_HOST})`);
    return transporter;
  }

  if (SMTP_SERVICE && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      service: SMTP_SERVICE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
    console.log(`[EmailService] Configured ${SMTP_SERVICE} transporter for ${SMTP_USER}`);
    return transporter;
  }

  // Attempt to create Ethereal test account for local development
  try {
    etherealAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: etherealAccount.user,
        pass: etherealAccount.pass
      }
    });
    console.log(`[EmailService] Configured Ethereal Test Account (${etherealAccount.user})`);
    return transporter;
  } catch (err) {
    console.warn(`[EmailService] Could not reach Ethereal (${err.message}). Using JSON/stream fallback transporter.`);
    transporter = nodemailer.createTransport({
      jsonTransport: true
    });
    return transporter;
  }
};

/**
 * Sends a luxury booking confirmation email to the user's registered email.
 */
export const sendBookingConfirmationEmail = async ({
  recipientEmail,
  recipientName = 'Valued Traveler',
  booking,
  itemTitle = 'Tourism Service',
  itemLocation = '',
  itemType = 'Tour',
  specialRequests = ''
}) => {
  if (!recipientEmail) {
    console.warn('[EmailService] Recipient email is missing; skipping confirmation email.');
    return { sent: false, error: 'Recipient email is missing' };
  }

  const activeTransporter = await getTransporter();
  const fromAddress = process.env.EMAIL_FROM || '"IntelliTrip Luxury Concierge" <concierge@intellitrip.com>';
  const b = booking || {};
  const referenceId = b._id
    ? `#INT-${b._id.toString().substring(b._id.toString().length - 8).toUpperCase()}`
    : '#INT-CONFIRMED';

  const startDateFormatted = b.startDate
    ? new Date(b.startDate).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Pending Scheduling';

  const endDateFormatted =
    b.endDate && b.endDate !== b.startDate
      ? new Date(b.endDate).toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      : null;

  const displayCurrency = '₹';
  const displayPrice = `₹${Number(b.totalPrice || 0).toLocaleString('en-IN')}`;
  const guestsCount = Number(b.guests) || 1;
  const contactPhone = b.contactPhone || 'On File';

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Booking Confirmation - IntelliTrip</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0f0712;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #f8fafc;
    }
    .container {
      max-width: 640px;
      margin: 24px auto;
      background-color: #1a0b1d;
      border: 1px solid #d4af37;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.7);
    }
    .header {
      background: linear-gradient(135deg, #240d29 0%, #3e1245 100%);
      padding: 32px 24px;
      text-align: center;
      border-bottom: 2px solid #d4af37;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      color: #f7e7be;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      font-weight: 800;
    }
    .header p {
      margin: 6px 0 0 0;
      color: #d4af37;
      font-size: 13px;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .content {
      padding: 32px 24px;
    }
    .badge {
      display: inline-block;
      background-color: rgba(212, 175, 55, 0.15);
      border: 1px solid #d4af37;
      color: #f7e7be;
      font-weight: 700;
      font-size: 12px;
      padding: 4px 12px;
      border-radius: 20px;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .greeting {
      font-size: 20px;
      font-weight: 700;
      color: #f7e7be;
      margin-bottom: 12px;
    }
    .intro {
      font-size: 15px;
      line-height: 1.6;
      color: #e2d5e6;
      margin-bottom: 24px;
    }
    .summary-card {
      background-color: #241129;
      border: 1px solid rgba(212, 175, 55, 0.4);
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .summary-header {
      font-size: 18px;
      font-weight: 700;
      color: #f7e7be;
      margin-bottom: 4px;
    }
    .summary-location {
      font-size: 13px;
      color: #d4af37;
      margin-bottom: 16px;
    }
    .table-details {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    .table-details td {
      padding: 8px 0;
      border-bottom: 1px solid rgba(212, 175, 55, 0.15);
    }
    .table-details td.label {
      color: #bda3c4;
      width: 40%;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    .table-details td.value {
      color: #f8fafc;
      font-weight: 600;
      text-align: right;
    }
    .price-row td {
      border-bottom: none;
      padding-top: 14px;
    }
    .price-value {
      font-size: 20px;
      font-weight: 800;
      color: #10b981;
    }
    .note-box {
      background-color: rgba(36, 17, 41, 0.6);
      border-left: 3px solid #d4af37;
      padding: 14px 16px;
      border-radius: 0 4px 4px 0;
      margin-bottom: 24px;
      font-size: 13px;
      line-height: 1.5;
      color: #ebdceb;
    }
    .footer {
      background-color: #120714;
      padding: 20px 24px;
      text-align: center;
      border-top: 1px solid rgba(212, 175, 55, 0.2);
      font-size: 12px;
      color: #8e7894;
    }
    .footer a {
      color: #d4af37;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>IntelliTrip</h1>
      <p>Luxury & Smart Tourism Management</p>
    </div>
    <div class="content">
      <div class="badge">✦ Booking Confirmed</div>
      <div class="greeting">Dear ${recipientName},</div>
      <p class="intro">
        Thank you for choosing IntelliTrip! Your reservation has been successfully confirmed. 
        Below are your official booking details and reservation reference.
      </p>

      <div class="summary-card">
        <div class="summary-header">${itemTitle}</div>
        ${itemLocation ? `<div class="summary-location">📍 ${itemLocation}</div>` : ''}

        <table class="table-details">
          <tr>
            <td class="label">Reference No.</td>
            <td class="value">${referenceId}</td>
          </tr>
          <tr>
            <td class="label">Booking Type</td>
            <td class="value">${itemType}</td>
          </tr>
          <tr>
            <td class="label">Date</td>
            <td class="value">${startDateFormatted}${endDateFormatted ? ` – ${endDateFormatted}` : ''}</td>
          </tr>
          ${booking.reservationTime ? `
          <tr>
            <td class="label">Time</td>
            <td class="value">${booking.reservationTime}</td>
          </tr>` : ''}
          <tr>
            <td class="label">Travelers / Guests</td>
            <td class="value">${guestsCount} Person${guestsCount > 1 ? 's' : ''}</td>
          </tr>
          <tr>
            <td class="label">Registered Email</td>
            <td class="value">${recipientEmail}</td>
          </tr>
          <tr>
            <td class="label">Contact Phone</td>
            <td class="value">${contactPhone}</td>
          </tr>
          <tr>
            <td class="label">Booking Status</td>
            <td class="value" style="color: #10b981;">Confirmed</td>
          </tr>
          ${specialRequests ? `
          <tr>
            <td class="label">Special Requests</td>
            <td class="value">${specialRequests}</td>
          </tr>` : ''}
          <tr class="price-row">
            <td class="label">Total Amount</td>
            <td class="value price-value">${displayPrice}</td>
          </tr>
        </table>
      </div>

      <div class="note-box">
        <strong>Important Travel Note:</strong> Please present your booking reference <strong>${referenceId}</strong> upon arrival or check-in. You can also view, manage, and access offline passes anytime in your IntelliTrip account portal.
      </div>
    </div>
    <div class="footer">
      <p>This automated confirmation was sent to your registered email <strong>${recipientEmail}</strong>.</p>
      <p>&copy; ${new Date().getFullYear()} IntelliTrip Inc. All rights reserved. • Concierge Support: support@intellitrip.com</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const textBody = `
IntelliTrip - Booking Confirmation
======================================================
Dear ${recipientName},

Your booking reservation has been successfully confirmed!

Booking Reference: ${referenceId}
Service: ${itemTitle}
Type: ${itemType}
${itemLocation ? `Location: ${itemLocation}\n` : ''}Date: ${startDateFormatted}${endDateFormatted ? ` to ${endDateFormatted}` : ''}
${booking.reservationTime ? `Time: ${booking.reservationTime}\n` : ''}Guests: ${guestsCount}
Registered Email: ${recipientEmail}
Contact Phone: ${contactPhone}
Total Amount: ${displayPrice}
Status: Confirmed
${specialRequests ? `Special Requests: ${specialRequests}\n` : ''}
======================================================
Please present reference ${referenceId} upon arrival.
Manage your trips at IntelliTrip Tourist Dashboard.
  `.trim();

  try {
    const info = await activeTransporter.sendMail({
      from: fromAddress,
      to: recipientEmail,
      subject: `IntelliTrip Booking Confirmation - ${itemTitle} (${referenceId})`,
      text: textBody,
      html: htmlBody
    });

    let previewUrl = null;
    if (nodemailer.getTestMessageUrl) {
      previewUrl = nodemailer.getTestMessageUrl(info);
    }

    console.log(`[EmailService] Booking confirmation email dispatched to registered email ${recipientEmail}. MessageId: ${info.messageId}`);
    if (previewUrl) {
      console.log(`[EmailService] Test preview URL: ${previewUrl}`);
    }

    return {
      sent: true,
      messageId: info.messageId,
      previewUrl,
      recipient: recipientEmail
    };
  } catch (sendError) {
    console.error(`[EmailService] Failed to send email to ${recipientEmail}:`, sendError.message);
    return {
      sent: false,
      error: sendError.message,
      recipient: recipientEmail
    };
  }
};

