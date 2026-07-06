import { getTranslation } from '@/hooks/useTranslation';
import nodemailer from 'nodemailer';

const getDomain = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  return "http://localhost:3000";
};

const domain = getDomain();

// Création du transporteur Nodemailer avec Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export const sendVerificationEmail = async (email: string, token: string, language: string = 'fr') => {
  const confirmLink = `${domain}/api/auth/verify-email?token=${token}`;

  const subject = getTranslation('mail.confirm_subject', language);
  const title = getTranslation('mail.confirm_title', language);
  const body = getTranslation('mail.confirm_body', language);
  const btn = getTranslation('mail.confirm_btn', language);
  const ignore = getTranslation('mail.confirm_ignore', language);

  const mailOptions = {
    from: `"ThaiLearn" <${process.env.EMAIL_SERVER_USER}>`,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h1 style="color: #4f46e5;">${title}</h1>
        <p>${body}</p>
        <a href="${confirmLink}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 10px; font-weight: bold;">
          ${btn}
        </a>
        <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">${ignore}</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Nodemailer Error (Verification):", error);
    throw new Error("Erreur lors de l'envoi de l'email");
  }
};

export const sendPasswordResetEmail = async (email: string, token: string, language: string = 'fr') => {
  const resetLink = `${domain}/reset-password?token=${token}`;

  const subject = getTranslation('mail.reset_subject', language);
  const title = getTranslation('mail.reset_title', language);
  const body = getTranslation('mail.reset_body', language);
  const btn = getTranslation('mail.reset_btn', language);
  const ignore = getTranslation('mail.reset_ignore', language);

  const mailOptions = {
    from: `"ThaiLearn" <${process.env.EMAIL_SERVER_USER}>`,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h1 style="color: #4f46e5;">${title}</h1>
        <p>${body}</p>
        <a href="${resetLink}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 10px; font-weight: bold;">
          ${btn}
        </a>
        <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">${ignore}</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Nodemailer Error (Reset Password):", error);
    throw new Error("Erreur lors de l'envoi de l'email");
  }
};
