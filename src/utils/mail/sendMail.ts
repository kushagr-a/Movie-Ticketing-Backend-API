// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// dotenv.config();

// interface SendMailOptions {
//   to: string;
//   subject: string;
//   html: string;
// }

// export const sendMail = async ({ to, subject, html }: SendMailOptions) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.MAIL_USER,
//         pass: process.env.MAIL_PASS,
//       },
//     });

//     const mailOptions = {
//       from: `"Ticket Booking App" <${process.env.MAIL_USER}>`,
//       to,
//       subject,
//       html,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log("✅ Mail sent successfully");
//   } catch (error) {
//     console.error("❌ Error sending email:", error);
//   }
// };

import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

// Email Templates
export const emailTemplates = {
  // 🎟️ Booking Confirmation Email
  bookingConfirmation: (data: {
    userName: string;
    movieName: string;
    showTime: string;
    seats: string[];
    totalAmount: number;
    bookingId: string;
    theatreName: string;
    showDate: string;
  }) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎬 Booking Confirmed!</h1>
                  <p style="color: #ffffff; margin: 10px 0 0; font-size: 16px;">Your movie tickets are ready</p>
                </td>
              </tr>
              
              <!-- Booking Details -->
              <tr>
                <td style="padding: 30px;">
                  <p style="color: #333; font-size: 16px; margin: 0 0 20px;">Hi <strong>${data.userName}</strong>,</p>
                  <p style="color: #666; font-size: 14px; margin: 0 0 30px;">Your booking has been confirmed! Get ready for an amazing movie experience.</p>
                  
                  <!-- Movie Info Card -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
                    <tr>
                      <td style="padding: 20px;">
                        <h2 style="color: #667eea; margin: 0 0 15px; font-size: 22px;">${data.movieName}</h2>
                        <table width="100%" cellpadding="5" cellspacing="0">
                          <tr>
                            <td style="color: #666; font-size: 14px; width: 40%;">🎭 Theatre:</td>
                            <td style="color: #333; font-size: 14px; font-weight: 600;">${data.theatreName}</td>
                          </tr>
                          <tr>
                            <td style="color: #666; font-size: 14px;">📅 Date:</td>
                            <td style="color: #333; font-size: 14px; font-weight: 600;">${data.showDate}</td>
                          </tr>
                          <tr>
                            <td style="color: #666; font-size: 14px;">🕐 Time:</td>
                            <td style="color: #333; font-size: 14px; font-weight: 600;">${data.showTime}</td>
                          </tr>
                          <tr>
                            <td style="color: #666; font-size: 14px;">💺 Seats:</td>
                            <td style="color: #333; font-size: 14px; font-weight: 600;">${data.seats.join(", ")}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Payment Info -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 2px solid #e0e0e0; padding-top: 20px; margin-top: 20px;">
                    <tr>
                      <td>
                        <table width="100%" cellpadding="5" cellspacing="0">
                          <tr>
                            <td style="color: #666; font-size: 14px;">Booking ID:</td>
                            <td style="color: #333; font-size: 14px; font-weight: 600; text-align: right;">${data.bookingId}</td>
                          </tr>
                          <tr>
                            <td style="color: #666; font-size: 16px; font-weight: 600;">Total Amount:</td>
                            <td style="color: #667eea; font-size: 20px; font-weight: 700; text-align: right;">₹${data.totalAmount}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                    <tr>
                      <td align="center">
                        <a href="#" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block; font-size: 16px;">View Booking Details</a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Important Note -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                    <tr>
                      <td style="padding: 15px;">
                        <p style="margin: 0; color: #856404; font-size: 13px;"><strong>⚠️ Important:</strong> Please carry a valid ID proof and reach the theatre at least 15 minutes before the show time.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                  <p style="color: #666; font-size: 12px; margin: 0 0 10px;">Need help? Contact us at support@ticketbooking.com</p>
                  <p style="color: #999; font-size: 11px; margin: 0;">© 2025 Ticket Booking App. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `,

  // ✅ Welcome Email
  welcomeEmail: (data: { userName: string; email: string }) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 32px;">🎉 Welcome to Our Platform!</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #333; margin: 0 0 20px; font-size: 24px;">Hello ${data.userName}! 👋</h2>
                  <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Thank you for joining our movie ticket booking platform. We're excited to have you on board!</p>
                  
                  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 30px 0;">
                    <h3 style="color: #667eea; margin: 0 0 15px; font-size: 18px;">What You Can Do:</h3>
                    <ul style="color: #666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                      <li>Browse latest movies and shows</li>
                      <li>Book tickets instantly</li>
                      <li>Choose your favorite seats</li>
                      <li>Get instant booking confirmations</li>
                      <li>Access booking history anytime</li>
                    </ul>
                  </div>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                    <tr>
                      <td align="center">
                        <a href="#" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block; font-size: 16px;">Start Booking Now</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                  <p style="color: #666; font-size: 12px; margin: 0 0 10px;">Questions? Reply to this email or contact support@ticketbooking.com</p>
                  <p style="color: #999; font-size: 11px; margin: 0;">© 2025 Ticket Booking App. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `,

  // 🔄 Booking Cancellation
  bookingCancellation: (data: {
    userName: string;
    movieName: string;
    bookingId: string;
    refundAmount: number;
  }) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Cancelled</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px;">❌ Booking Cancelled</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 30px;">
                  <p style="color: #333; font-size: 16px; margin: 0 0 20px;">Hi <strong>${data.userName}</strong>,</p>
                  <p style="color: #666; font-size: 14px; margin: 0 0 30px;">Your booking has been cancelled successfully.</p>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
                    <tr>
                      <td style="padding: 20px;">
                        <table width="100%" cellpadding="5" cellspacing="0">
                          <tr>
                            <td style="color: #666; font-size: 14px;">Movie:</td>
                            <td style="color: #333; font-size: 14px; font-weight: 600;">${data.movieName}</td>
                          </tr>
                          <tr>
                            <td style="color: #666; font-size: 14px;">Booking ID:</td>
                            <td style="color: #333; font-size: 14px; font-weight: 600;">${data.bookingId}</td>
                          </tr>
                          <tr>
                            <td style="color: #666; font-size: 16px; font-weight: 600;">Refund Amount:</td>
                            <td style="color: #28a745; font-size: 20px; font-weight: 700;">₹${data.refundAmount}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #d1ecf1; border-left: 4px solid #0c5460; border-radius: 4px; margin-top: 20px;">
                    <tr>
                      <td style="padding: 15px;">
                        <p style="margin: 0; color: #0c5460; font-size: 13px;"><strong>ℹ️ Note:</strong> Your refund will be processed within 5-7 business days.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                  <p style="color: #666; font-size: 12px; margin: 0 0 10px;">Need help? Contact us at support@ticketbooking.com</p>
                  <p style="color: #999; font-size: 11px; margin: 0;">© 2025 Ticket Booking App. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `,

  // 🔐 Password Reset
  passwordReset: (data: { userName: string; resetLink: string }) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🔐 Password Reset Request</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 30px;">
                  <p style="color: #333; font-size: 16px; margin: 0 0 20px;">Hi <strong>${data.userName}</strong>,</p>
                  <p style="color: #666; font-size: 14px; margin: 0 0 30px;">We received a request to reset your password. Click the button below to create a new password:</p>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <a href="${data.resetLink}" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block; font-size: 16px;">Reset Password</a>
                      </td>
                    </tr>
                  </table>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; margin-top: 30px;">
                    <tr>
                      <td style="padding: 15px;">
                        <p style="margin: 0; color: #856404; font-size: 13px;"><strong>⚠️ Security Note:</strong> This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                  <p style="color: #666; font-size: 12px; margin: 0 0 10px;">Need help? Contact us at support@ticketbooking.com</p>
                  <p style="color: #999; font-size: 11px; margin: 0;">© 2025 Ticket Booking App. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `,
};

// Main Send Mail Function
export const sendMail = async ({ to, subject, html }: SendMailOptions) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"🎬 Ticket Booking App" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Mail sent successfully to:", to);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return { success: false, error };
  }
};

// Helper Functions for Easy Usage
export const sendBookingConfirmation = async (
  to: string,
  bookingData: Parameters<typeof emailTemplates.bookingConfirmation>[0]
) => {
  return await sendMail({
    to,
    subject: "🎟️ Booking Confirmed - Your Movie Tickets",
    html: emailTemplates.bookingConfirmation(bookingData),
  });
};

export const sendWelcomeEmail = async (
  to: string,
  userData: Parameters<typeof emailTemplates.welcomeEmail>[0]
) => {
  return await sendMail({
    to,
    subject: "🎉 Welcome to Ticket Booking App!",
    html: emailTemplates.welcomeEmail(userData),
  });
};

export const sendCancellationEmail = async (
  to: string,
  cancellationData: Parameters<typeof emailTemplates.bookingCancellation>[0]
) => {
  return await sendMail({
    to,
    subject: "❌ Booking Cancelled - Refund Initiated",
    html: emailTemplates.bookingCancellation(cancellationData),
  });
};

export const sendPasswordResetEmail = async (
  to: string,
  resetData: Parameters<typeof emailTemplates.passwordReset>[0]
) => {
  return await sendMail({
    to,
    subject: "🔐 Password Reset Request",
    html: emailTemplates.passwordReset(resetData),
  });
};