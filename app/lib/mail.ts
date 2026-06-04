import nodemailer from 'nodemailer';

const domain = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Création du transporteur Nodemailer avec Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: `"ThaiLearn" <${process.env.EMAIL_SERVER_USER}>`,
    to: email,
    subject: "Confirme ton adresse email - ThaiLearn",
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h1 style="color: #4f46e5;">Bienvenue sur ThaiLearn !</h1>
        <p>Merci de t'être inscrit(e). Pour vérifier ton compte, clique sur le lien ci-dessous :</p>
        <a href="${confirmLink}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 10px; font-weight: bold;">
          Confirmer mon email
        </a>
        <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">Si tu n'as pas créé ce compte, tu peux ignorer cet email.</p>
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

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"ThaiLearn" <${process.env.EMAIL_SERVER_USER}>`,
    to: email,
    subject: "Réinitialisation de ton mot de passe - ThaiLearn",
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h1 style="color: #4f46e5;">Réinitialisation de mot de passe</h1>
        <p>Tu as demandé à réinitialiser ton mot de passe. Clique sur le lien ci-dessous pour le changer :</p>
        <a href="${resetLink}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 10px; font-weight: bold;">
          Réinitialiser mon mot de passe
        </a>
        <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">Si tu n'as pas fait cette demande, tu peux ignorer cet email.</p>
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
