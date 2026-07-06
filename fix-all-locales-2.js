const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');
const jsonFiles = {
  fr: JSON.parse(fs.readFileSync(path.join(localesDir, 'fr.json'), 'utf8')),
  en: JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8')),
  de: JSON.parse(fs.readFileSync(path.join(localesDir, 'de.json'), 'utf8')),
  es: JSON.parse(fs.readFileSync(path.join(localesDir, 'es.json'), 'utf8')),
  it: JSON.parse(fs.readFileSync(path.join(localesDir, 'it.json'), 'utf8'))
};

function addTranslation(key, translations) {
  for (const lang in translations) {
    if (jsonFiles[lang]) {
      jsonFiles[lang][key] = translations[lang];
    }
  }
}

// ToneAnalyzerContent.tsx
addTranslation('tone.remove_split', { fr: 'Supprimer la coupure', en: 'Remove split', de: 'Teilung entfernen', es: 'Quitar separación', it: 'Rimuovi divisione' });
addTranslation('tone.split_here', { fr: 'Couper la syllabe ici', en: 'Split syllable here', de: 'Silbe hier teilen', es: 'Dividir sílaba aquí', it: 'Dividi sillaba qui' });
addTranslation('tone.search_another', { fr: 'Rechercher un autre mot', en: 'Search another word', de: 'Anderes Wort suchen', es: 'Buscar otra palabra', it: "Cerca un'altra parola" });
addTranslation('tone.enter_word', { fr: 'Entrez un mot thaï', en: 'Enter a Thai word', de: 'Geben Sie ein thailändisches Wort ein', es: 'Ingrese una palabra tailandesa', it: 'Inserisci una parola tailandese' });
addTranslation('tone.current_syllable', { fr: 'Syllabe en cours', en: 'Current Syllable', de: 'Aktuelle Silbe', es: 'Sílaba actual', it: 'Sillaba corrente' });
addTranslation('tone.listen', { fr: 'Écouter', en: 'Listen', de: 'Zuhören', es: 'Escuchar', it: 'Ascoltare' });
addTranslation('tone.why_this_tone', { fr: 'Pourquoi ce ton ?', en: 'Why this tone?', de: 'Warum dieser Ton?', es: '¿Por qué este tono?', it: 'Perché questo tono?' });
addTranslation('tone.explanation', { fr: 'Explication', en: 'Explanation', de: 'Erklärung', es: 'Explicación', it: 'Spiegazione' });

// Generators
addTranslation('exercise.match_pairs', { fr: 'Reliez les paires correspondantes', en: 'Match the pairs', de: 'Verbinden Sie die Paare', es: 'Une los pares', it: 'Abbina le coppie' });

// Mail.ts
addTranslation('mail.confirm_subject', { fr: 'Confirme ton adresse email - ThaiLearn', en: 'Confirm your email address - ThaiLearn', de: 'Bestätige deine E-Mail-Adresse - ThaiLearn', es: 'Confirma tu dirección de correo electrónico - ThaiLearn', it: 'Conferma il tuo indirizzo email - ThaiLearn' });
addTranslation('mail.confirm_title', { fr: 'Bienvenue sur ThaiLearn !', en: 'Welcome to ThaiLearn!', de: 'Willkommen bei ThaiLearn!', es: '¡Bienvenido a ThaiLearn!', it: 'Benvenuto su ThaiLearn!' });
addTranslation('mail.confirm_body', { fr: "Merci de t'être inscrit(e). Pour vérifier ton compte, clique sur le lien ci-dessous :", en: "Thank you for registering. To verify your account, click the link below:", de: "Danke für deine Registrierung. Klicke auf den Link unten, um dein Konto zu bestätigen:", es: "Gracias por registrarte. Para verificar tu cuenta, haz clic en el enlace a continuación:", it: "Grazie per esserti registrato. Per verificare il tuo account, fai clic sul link sottostante:" });
addTranslation('mail.confirm_btn', { fr: 'Confirmer mon email', en: 'Confirm my email', de: 'E-Mail bestätigen', es: 'Confirmar mi correo electrónico', it: 'Conferma la mia email' });
addTranslation('mail.confirm_ignore', { fr: "Si tu n'as pas créé ce compte, tu peux ignorer cet email.", en: "If you didn't create this account, you can ignore this email.", de: "Wenn du dieses Konto nicht erstellt hast, kannst du diese E-Mail ignorieren.", es: "Si no creaste esta cuenta, puedes ignorar este correo electrónico.", it: "Se non hai creato questo account, puoi ignorare questa email." });

addTranslation('mail.reset_subject', { fr: 'Réinitialisation de ton mot de passe - ThaiLearn', en: 'Reset your password - ThaiLearn', de: 'Setze dein Passwort zurück - ThaiLearn', es: 'Restablece tu contraseña - ThaiLearn', it: 'Reimposta la tua password - ThaiLearn' });
addTranslation('mail.reset_title', { fr: 'Réinitialisation de mot de passe', en: 'Password Reset', de: 'Passwort zurücksetzen', es: 'Restablecimiento de contraseña', it: 'Reimpostazione password' });
addTranslation('mail.reset_body', { fr: 'Tu as demandé à réinitialiser ton mot de passe. Clique sur le lien ci-dessous pour le changer :', en: 'You requested to reset your password. Click the link below to change it:', de: 'Du hast das Zurücksetzen deines Passworts angefordert. Klicke auf den Link unten, um es zu ändern:', es: 'Solicitaste restablecer tu contraseña. Haz clic en el enlace a continuación para cambiarla:', it: 'Hai richiesto di reimpostare la tua password. Fai clic sul link sottostante per cambiarla:' });
addTranslation('mail.reset_btn', { fr: 'Réinitialiser mon mot de passe', en: 'Reset my password', de: 'Mein Passwort zurücksetzen', es: 'Restablecer mi contraseña', it: 'Reimposta la mia password' });
addTranslation('mail.reset_ignore', { fr: "Si tu n'as pas fait cette demande, tu peux ignorer cet email.", en: "If you didn't make this request, you can ignore this email.", de: "Wenn du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.", es: "Si no hiciste esta solicitud, puedes ignorar este correo electrónico.", it: "Se non hai fatto questa richiesta, puoi ignorare questa email." });

// Replace JSON files
for (const lang in jsonFiles) {
  fs.writeFileSync(path.join(localesDir, `${lang}.json`), JSON.stringify(jsonFiles[lang], null, 2));
  console.log(`Updated ${lang}.json`);
}

function replaceInFile(file, replacements) {
  const fullPath = path.join(__dirname, 'src', file);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  for (const rep of replacements) {
    if (content.includes(rep.search)) {
      content = content.split(rep.search).join(rep.replace);
      modified = true;
    }
  }
  if (modified) {
    fs.writeFileSync(fullPath, content);
    console.log(`Modified ${file}`);
  }
}

replaceInFile('components/tone-analyzer/ToneAnalyzerContent.tsx', [
  { search: `title={language === 'en' ? 'Remove split' : 'Supprimer la coupure'}`, replace: `title={getTranslation('tone.remove_split', language)}` },
  { search: `title={language === 'en' ? 'Split syllable here' : 'Couper la syllabe ici'}`, replace: `title={getTranslation('tone.split_here', language)}` },
  { search: `{language === 'en' ? 'Search another word' : 'Rechercher un autre mot'}`, replace: `{getTranslation('tone.search_another', language)}` },
  { search: `{language === 'en' ? (mode === 'guided' ? 'Current Syllable' : 'Enter a Thai word') : (mode === 'guided' ? 'Syllabe en cours' : 'Entrez un mot thaï')}`, replace: `{mode === 'guided' ? getTranslation('tone.current_syllable', language) : getTranslation('tone.enter_word', language)}` },
  { search: `title={language === 'en' ? 'Listen' : 'Écouter'}`, replace: `title={getTranslation('tone.listen', language)}` },
  { search: `{language === 'en' ? 'Why this tone?' : 'Pourquoi ce ton ?'}`, replace: `{getTranslation('tone.why_this_tone', language)}` },
  { search: `{language === 'en' ? 'Explanation' : 'Explication'}`, replace: `{getTranslation('tone.explanation', language)}` }
]);

replaceInFile('components/ui/LessonSelector.tsx', [
  { search: `{language === 'en' && lesson.titleEn ? lesson.titleEn : lesson.title}`, replace: `{getLocalizedField(lesson, 'title', language)}` }
]);

replaceInFile('components/ui/VocabularySelector.tsx', [
  { search: `{language === 'en' && item.en ? item.en : item.fr}`, replace: `{getLocalizedField(item, '', language)}` }
]);

replaceInFile('lib/generators/builders/pair-matching-builder.ts', [
  { search: `question: (language === 'en' ? 'Match the pairs' : language === 'fr' ? 'Reliez les paires correspondantes' : 'Match the pairs'),`, replace: `question: getTranslation('exercise.match_pairs', language),` }
]);

replaceInFile('lib/generators/pair-matching-generator.ts', [
  { search: `question: (language === 'en' ? 'Match the pairs' : language === 'fr' ? 'Reliez les paires correspondantes' : 'Match the pairs'),`, replace: `question: getTranslation('exercise.match_pairs', language),` }
]);

// Need to inject imports into the mail and generators correctly if not present.
// For now, replace string text and rely on auto imports, or add imports manually below.

replaceInFile('lib/mail.ts', [
  { search: `const subject = language === 'en' ? "Confirm your email address - ThaiLearn" : "Confirme ton adresse email - ThaiLearn";`, replace: `const subject = getTranslation('mail.confirm_subject', language);` },
  { search: `const title = language === 'en' ? "Welcome to ThaiLearn!" : "Bienvenue sur ThaiLearn !";`, replace: `const title = getTranslation('mail.confirm_title', language);` },
  { search: `const body = language === 'en' ? "Thank you for registering. To verify your account, click the link below:" : "Merci de t'être inscrit(e). Pour vérifier ton compte, clique sur le lien ci-dessous :";`, replace: `const body = getTranslation('mail.confirm_body', language);` },
  { search: `const btn = language === 'en' ? "Confirm my email" : "Confirmer mon email";`, replace: `const btn = getTranslation('mail.confirm_btn', language);` },
  { search: `const ignore = language === 'en' ? "If you didn't create this account, you can ignore this email." : "Si tu n'as pas créé ce compte, tu peux ignorer cet email.";`, replace: `const ignore = getTranslation('mail.confirm_ignore', language);` },
  { search: `const subject = language === 'en' ? "Reset your password - ThaiLearn" : "Réinitialisation de ton mot de passe - ThaiLearn";`, replace: `const subject = getTranslation('mail.reset_subject', language);` },
  { search: `const title = language === 'en' ? "Password Reset" : "Réinitialisation de mot de passe";`, replace: `const title = getTranslation('mail.reset_title', language);` },
  { search: `const body = language === 'en' ? "You requested to reset your password. Click the link below to change it:" : "Tu as demandé à réinitialiser ton mot de passe. Clique sur le lien ci-dessous pour le changer :";`, replace: `const body = getTranslation('mail.reset_body', language);` },
  { search: `const btn = language === 'en' ? "Reset my password" : "Réinitialiser mon mot de passe";`, replace: `const btn = getTranslation('mail.reset_btn', language);` },
  { search: `const ignore = language === 'en' ? "If you didn't make this request, you can ignore this email." : "Si tu n'as pas fait cette demande, tu peux ignorer cet email.";`, replace: `const ignore = getTranslation('mail.reset_ignore', language);` }
]);

