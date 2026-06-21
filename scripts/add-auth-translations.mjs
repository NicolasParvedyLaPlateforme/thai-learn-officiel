import fs from 'fs';

const appDir = 'c:\\xampp\\htdocs\\thai-learn-officiel\\app';

const dicts = ['en', 'fr', 'de', 'es', 'it'];
const keys = {
  'auth.back': { en: 'Back to home', fr: 'Retour à l\'accueil' },
  'auth.welcome_back': { en: 'Welcome back ! 👋', fr: 'Bon retour ! 👋' },
  'auth.create_account': { en: 'Create an account 🚀', fr: 'Créer un compte 🚀' },
  'auth.error_registration': { en: 'Error during registration', fr: 'Erreur lors de l\'inscription' },
  'auth.error_network': { en: 'Network error', fr: 'Erreur réseau' },
  'auth.name_label': { en: 'Name or Username', fr: 'Nom ou Pseudo' },
  'auth.name_placeholder': { en: 'Your name', fr: 'Ton prénom' },
  'auth.email_label': { en: 'Email', fr: 'Email' },
  'auth.email_placeholder': { en: 'your@email.com', fr: 'ton@email.com' },
  'auth.password_label': { en: 'Password', fr: 'Mot de passe' },
  'auth.forgot_password': { en: 'Forgot password?', fr: 'Mot de passe oublié ?' },
  'auth.login': { en: 'Login', fr: 'Se connecter' },
  'auth.signup': { en: 'Sign up', fr: 'S\'inscrire' },
  'auth.no_account': { en: 'Don\'t have an account? ', fr: 'Pas encore de compte ? ' },
  'auth.has_account': { en: 'Already have an account? ', fr: 'Déjà un compte ? ' },
  
  // Forgot password page
  'auth.forgot_title': { en: 'Forgot Password 🔒', fr: 'Mot de passe oublié 🔒' },
  'auth.forgot_desc': { en: 'Enter your email to receive a reset link.', fr: 'Entrez votre email pour recevoir un lien de réinitialisation.' },
  'auth.send_link': { en: 'Send reset link', fr: 'Envoyer le lien' },
  'auth.back_login': { en: 'Back to login', fr: 'Retour à la connexion' },
  'auth.check_email': { en: 'Check your email for the reset link.', fr: 'Vérifiez votre email pour le lien de réinitialisation.' },

  // Reset password page
  'auth.reset_title': { en: 'Reset Password 🔑', fr: 'Réinitialiser le mot de passe 🔑' },
  'auth.new_password': { en: 'New Password', fr: 'Nouveau mot de passe' },
  'auth.confirm_password': { en: 'Confirm Password', fr: 'Confirmer le mot de passe' },
  'auth.update_password': { en: 'Update password', fr: 'Mettre à jour' },
  'auth.password_mismatch': { en: 'Passwords do not match', fr: 'Les mots de passe ne correspondent pas' },
  'auth.password_updated': { en: 'Password updated successfully.', fr: 'Mot de passe mis à jour avec succès.' },

  // Profile page
  'auth.profile_title': { en: 'My Profile', fr: 'Mon Profil' },
  'auth.logout': { en: 'Logout', fr: 'Se déconnecter' },
  'auth.save_changes': { en: 'Save changes', fr: 'Enregistrer les modifications' },

  // Emails
  'auth.email_reset_subject': { en: 'Reset your password - ThaiLearn', fr: 'Réinitialisez votre mot de passe - ThaiLearn' },
  'auth.email_reset_body': { en: 'Click here to reset your password:', fr: 'Cliquez ici pour réinitialiser votre mot de passe :' }
};

for (const lang of dicts) {
  const filePath = `${appDir}/locales/${lang}.json`;
  let data = {};
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  
  for (const [key, translations] of Object.entries(keys)) {
    if (!data[key]) {
      data[key] = translations[lang] || '';
    }
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Updated ${lang}.json`);
}
