"use server";

import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { OTPEmail } from "@/components/admin/otp-email";

// Function to create a transporter based on provider
function createTransporter() {
  const provider = process.env.EMAIL_PROVIDER?.toLowerCase() || "gmail";

  switch (provider) {
    case "naver":
      return nodemailer.createTransport({
        host: "smtp.naver.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

    case "kakao":
      return nodemailer.createTransport({
        host: "smtp.daum.net",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

    case "gmail":
    default:
      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
  }
}

// Get the email address based on provider
function getEmailAddress() {
  const provider = process.env.EMAIL_PROVIDER?.toLowerCase() || "gmail";
  const user = process.env.EMAIL_USER || "";

  switch (provider) {
    case "kakao":
      // For Kakao, append @kakao.com if not already included
      return user.includes("@") ? user : `${user}@kakao.com`;
    default:
      // For other providers, use the email as is
      return user;
  }
}

// Create the transporter
const transporter = createTransporter();
const emailAddress = getEmailAddress();

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    // Use "Weetoo Admin" as the display name
    const fromAddress = `"Weetoo Admin" <${emailAddress}>`;

    console.log(
      `Sending email via ${process.env.EMAIL_PROVIDER || "gmail"} from ${fromAddress} to ${to}`
    );

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
    });

    console.log(`Email sent successfully. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Function specifically for sending OTP emails
export async function sendOtpEmail(email: string, otp: string) {
  try {
    const subject = "Admin Panel Access Verification";

    // Get the user's first name from the email (if available)
    const userName = email
      .split("@")[0]
      .split(".")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    // Render the React Email component to HTML
    const html = await render(
      OTPEmail({
        otp,
        userName,
        expiryTime: "24 hours",
      })
    );

    return sendEmail(email, subject, html);
  } catch (error) {
    console.error("Error rendering email template:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
