import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'app', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const newKeys = {
  fr: {
    "auth.pseudo_updated_success": "Pseudo mis à jour avec succès.",
    "auth.email_verified_success": "Super ! Ton adresse email a été vérifiée avec succès.",
    "auth.my_pseudo": "Mon Pseudo",
    "auth.pseudo_label": "Votre Pseudo (Affiché dans le classement)",
    "auth.pseudo_placeholder": "Ex: NinjaThai",
    "auth.current_password": "Mot de passe actuel"
  },
  en: {
    "auth.pseudo_updated_success": "Username successfully updated.",
    "auth.email_verified_success": "Great! Your email address has been successfully verified.",
    "auth.my_pseudo": "My Username",
    "auth.pseudo_label": "Your Username (Displayed on the leaderboard)",
    "auth.pseudo_placeholder": "Ex: NinjaThai",
    "auth.current_password": "Current password"
  },
  de: {
    "auth.pseudo_updated_success": "Benutzername erfolgreich aktualisiert.",
    "auth.email_verified_success": "Toll! Ihre E-Mail-Adresse wurde erfolgreich verifiziert.",
    "auth.my_pseudo": "Mein Benutzername",
    "auth.pseudo_label": "Ihr Benutzername (wird in der Bestenliste angezeigt)",
    "auth.pseudo_placeholder": "Bsp: NinjaThai",
    "auth.current_password": "Aktuelles Passwort"
  },
  es: {
    "auth.pseudo_updated_success": "Nombre de usuario actualizado con éxito.",
    "auth.email_verified_success": "¡Genial! Tu dirección de correo electrónico ha sido verificada con éxito.",
    "auth.my_pseudo": "Mi seudónimo",
    "auth.pseudo_label": "Tu Seudónimo (Mostrado en la clasificación)",
    "auth.pseudo_placeholder": "Ej: NinjaThai",
    "auth.current_password": "Contraseña actual"
  },
  it: {
    "auth.pseudo_updated_success": "Nome utente aggiornato con successo.",
    "auth.email_verified_success": "Fantastico! Il tuo indirizzo email è stato verificato con successo.",
    "auth.my_pseudo": "Il mio nome utente",
    "auth.pseudo_label": "Il tuo Nome Utente (Mostrato in classifica)",
    "auth.pseudo_placeholder": "Es: NinjaThai",
    "auth.current_password": "Password attuale"
  }
};

for (const file of files) {
  const lang = file.replace('.json', '');
  if (!newKeys[lang]) continue;
  
  const filePath = path.join(localesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  // Add new keys
  Object.assign(data, newKeys[lang]);
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`Updated ${file}`);
}
