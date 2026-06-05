import nodemailer from 'nodemailer';

const getDomain = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL && process.env.VERCEL_ENV === "production") return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
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

  const subject = language === 'en' ? "Confirm your email address - ThaiLearn" : "Confirme ton adresse email - ThaiLearn";
  const title = language === 'en' ? "Welcome to ThaiLearn!" : "Bienvenue sur ThaiLearn !";
  const body = language === 'en' ? "Thank you for registering. To verify your account, click the link below:" : "Merci de t'être inscrit(e). Pour vérifier ton compte, clique sur le lien ci-dessous :";
  const btn = language === 'en' ? "Confirm my email" : "Confirmer mon email";
  const ignore = language === 'en' ? "If you didn't create this account, you can ignore this email." : "Si tu n'as pas créé ce compte, tu peux ignorer cet email.";

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

  const subject = language === 'en' ? "Reset your password - ThaiLearn" : "Réinitialisation de ton mot de passe - ThaiLearn";
  const title = language === 'en' ? "Password Reset" : "Réinitialisation de mot de passe";
  const body = language === 'en' ? "You requested to reset your password. Click the link below to change it:" : "Tu as demandé à réinitialiser ton mot de passe. Clique sur le lien ci-dessous pour le changer :";
  const btn = language === 'en' ? "Reset my password" : "Réinitialiser mon mot de passe";
  const ignore = language === 'en' ? "If you didn't make this request, you can ignore this email." : "Si tu n'as pas fait cette demande, tu peux ignorer cet email.";

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
