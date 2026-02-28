import { transporter, isEmailConfigured } from "../config/email";

export async function sendOtpEmail(toEmail: string, otp: string): Promise<void> {
  if (!isEmailConfigured) {
    throw new Error("Email service is not configured. Please add EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM to your environment.");
  }

  const expiryMinutes = 15;

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Password Reset OTP</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#006980,#00a3c4);padding:36px 40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Zalgo Edutech</h1>
              <p style="color:rgba(255,255,255,0.80);margin:8px 0 0;font-size:14px;">Password Reset Request</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">Hi there,</p>
              <p style="margin:0 0 28px;color:#374151;font-size:15px;line-height:1.6;">
                We received a request to reset your password. Use the OTP below to proceed.
                This code is valid for <strong>${expiryMinutes} minutes</strong>.
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background:#f0fafb;border:2px solid #006980;border-radius:12px;padding:24px 48px;text-align:center;">
                      <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Your OTP Code</p>
                      <p style="margin:0;font-size:40px;font-weight:800;letter-spacing:12px;color:#006980;font-family:'Courier New',monospace;">${otp}</p>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;color:#6b7280;font-size:13px;line-height:1.6;">
                If you did not request a password reset, you can safely ignore this email.
                Your password will not be changed.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                &copy; ${new Date().getFullYear()} Zalgo Edutech. All rights reserved.
              </p>
              <p style="margin:6px 0 0;color:#9ca3af;font-size:12px;">
                This is an automated email. Please do not reply.
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

  const textBody = `
Zalgo Edutech — Password Reset OTP

Your one-time password (OTP) is: ${otp}

This code expires in ${expiryMinutes} minutes.

If you did not request a password reset, please ignore this email.

— Zalgo Edutech Team
  `.trim();

  await transporter.sendMail({
    from: `"Zalgo Edutech" <${process.env.EMAIL_FROM}>`,
    to: toEmail,
    subject: `${otp} is your Zalgo Edutech password reset code`,
    text: textBody,
    html: htmlBody,
  });
}
