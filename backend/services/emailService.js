import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER?.trim(),
      pass: process.env.EMAIL_APP_PASSWORD?.trim(),
    },
  });
};

export const verifyEmailTransporter = async () => {
  try {
    const transporter = createTransporter();

    await transporter.verify();

    console.log("Email transporter is ready");

    return true;
  } catch (error) {
    console.error(
      "Email transporter verification failed:",
      error.message
    );

    return false;
  }
};

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: `LakshyaPath <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent successfully:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Email sending failed:", error.message);

    return {
      success: false,
      error: error.message,
    };
  }
};