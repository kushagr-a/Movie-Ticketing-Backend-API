import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

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
      from: `"Ticket Booking App" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Mail sent successfully");
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};
