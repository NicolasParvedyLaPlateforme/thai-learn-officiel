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

addTranslation('writing.write_this_word', { fr: 'Écrivez ce mot en thaï', en: 'Write this word in Thai', de: 'Schreibe dieses Wort auf Thai', es: 'Escribe esta palabra en tailandés', it: 'Scrivi questa parola in tailandese' });
addTranslation('writing.write_this_sentence', { fr: 'Écrivez cette phrase en thaï', en: 'Write this sentence in Thai', de: 'Schreibe diesen Satz auf Thai', es: 'Escribe esta oración en tailandés', it: 'Scrivi questa frase in tailandese' });
addTranslation('path.time_limit', { fr: 'Vous avez {minutes} minute{s} pour répondre à un maximum de questions. Plus vous allez loin, meilleur est votre score !', en: 'You have {minutes} minute{s} to answer as many questions as possible. The further you get, the better your score!', de: 'Du hast {minutes} Minute{s}, um so viele Fragen wie möglich zu beantworten. Je weiter du kommst, desto besser dein Ergebnis!', es: 'Tienes {minutes} minuto{s} para responder tantas preguntas como sea posible. ¡Cuanto más lejos llegues, mejor será tu puntuación!', it: 'Hai {minutes} minuto{s} per rispondere al maggior numero di domande possibile. Più vai avanti, migliore sarà il tuo punteggio!' });
addTranslation('tone.is_live_or_dead', { fr: "C'est une {type} commençant par une {class}", en: 'This is a {type} starting with a {class}', de: 'Dies ist eine {type}, die mit einem Konsonanten der {class} beginnt', es: 'Esta es una {type} que comienza con una {class}', it: 'Questa è una {type} che inizia con una {class}' });
addTranslation('tone.akson_nam_modifier', { fr: ' (modifiée par la consonne menante précédente via la règle Akson Nam)', en: ' (modified by the previous leading consonant via the Akson Nam rule)', de: ' (modifiziert durch den vorhergehenden führenden Konsonanten nach der Akson Nam-Regel)', es: ' (modificada por la consonante principal anterior mediante la regla Akson Nam)', it: ' (modificata dalla consonante iniziale precedente tramite la regola Akson Nam)' });
addTranslation('tone.implicit_sara_a', { fr: "💡 C'est une syllabe morte due à une voyelle courte implicite (Sara A).", en: '💡 This is a dead syllable due to an implicit short vowel (Sara A).', de: '💡 Dies ist eine tote Silbe aufgrund eines impliziten kurzen Vokals (Sara A).', es: '💡 Esta es una sílaba muerta debido a una vocal corta implícita (Sara A).', it: '💡 Questa è una sillaba morta a causa di una vocale corta implicita (Sara A).' });
addTranslation('tone.select_letter_to_analyze', { fr: "Sélectionnez une lettre pour voir l'analyse et la règle du ton", en: 'Select a letter to see the analysis and tone rules', de: 'Wähle einen Buchstaben, um die Analyse und Tonregeln zu sehen', es: 'Selecciona una letra para ver el análisis y las reglas de tono', it: "Seleziona una lettera per visualizzare l'analisi e le regole tonali" });
addTranslation('auto.find_word_position', { fr: 'Trouve la position du mot', en: 'Find the word position', de: 'Finde die Position des Wortes', es: 'Encuentra la posición de la palabra', it: 'Trova la posizione della parola' });
addTranslation('auto.listen_and_select_position', { fr: 'Écoute et sélectionne la bonne position', en: 'Listen and select the correct position', de: 'Höre zu und wähle die richtige Position', es: 'Escucha y selecciona la posición correcta', it: 'Ascolta e seleziona la posizione corretta' });

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

replaceInFile('components/lesson/Footer.tsx', [
  { search: `return language === "en"
                                ? correctOpt.en || correctOpt.fr
                                : correctOpt.fr;`, replace: `return getLocalizedField(correctOpt, '', language);` }
]);

replaceInFile('app/writing/page.tsx', [
  { search: `{language === 'en'
                    ? "Write this " + (currentExercise.id.includes('phrase') ? "sentence" : "word") + " in Thai"
                    : "Écrivez " + (currentExercise.id.includes('phrase') ? "cette phrase" : "ce mot") + " en thaï"}`, replace: `{currentExercise.id.includes('phrase') ? getTranslation('writing.write_this_sentence', language) : getTranslation('writing.write_this_word', language)}` },
  { search: `{language === 'en' ? charHint.noteEn : charHint.note}`, replace: `{getLocalizedField(charHint, 'note', language)}` }
]);

replaceInFile('components/path-ui/PathLessonModal.tsx', [
  { search: `{language === 'en'
                  ? \`You have \${estimatedMins} minute\${estimatedMins > 1 ? 's' : ''} to answer as many questions as possible. The further you get, the better your score!\`
                  : \`Vous avez \${estimatedMins} minute\${estimatedMins > 1 ? 's' : ''} pour répondre à un maximum de questions. Plus vous allez loin, meilleur est votre score !\`}`, replace: `{getTranslation('path.time_limit', language).replace('{minutes}', estimatedMins.toString()).replace('{s}', estimatedMins > 1 ? 's' : '')}` }
]);

replaceInFile('components/tone-analyzer/ToneAnalyzerContent.tsx', [
  { search: `{language === 'en' 
          ? \`This is a \${analysis.endingType === 'live' ? 'live' : 'dead'} syllable starting with a \${analysis.initialClass} class consonant\`
          : \`C'est une syllabe \${analysis.endingType === 'live' ? 'vivante' : 'morte'} commençant par une consonne de classe \${analysis.initialClass === 'high' ? 'haute' : analysis.initialClass === 'mid' ? 'moyenne' : 'basse'}\`}`, replace: `{getTranslation('tone.is_live_or_dead', language).replace('{type}', (analysis.endingType === 'live' ? getTranslation('tone.live_syllable', language) : getTranslation('tone.dead_syllable', language)).toLowerCase()).replace('{class}', (analysis.initialClass === 'high' ? getTranslation('tone.high_class', language) : analysis.initialClass === 'mid' ? getTranslation('tone.mid_class', language) : getTranslation('tone.low_class', language)).toLowerCase())}` },
  { search: `language === 'en' 
            ? " (modified by the previous leading consonant via the Akson Nam rule)"
            : " (modifiée par la consonne menante précédente via la règle Akson Nam)"`, replace: `getTranslation('tone.akson_nam_modifier', language)` },
  { search: `{language === 'en' 
              ? "💡 This is a dead syllable due to an implicit short vowel (Sara A)." 
              : "💡 C'est une syllabe morte due à une voyelle courte implicite (Sara A)." }`, replace: `{getTranslation('tone.implicit_sara_a', language)}` },
  { search: `{language === 'en' 
                    ? 'Select a letter to see the analysis and tone rules' 
                    : 'Sélectionnez une lettre pour voir l\\'analyse et la règle du ton'}`, replace: `{getTranslation('tone.select_letter_to_analyze', language)}` }
]);

replaceInFile('lib/generators/builders/sound-to-letter-builder.ts', [
  { search: `if (language === 'en') {`, replace: `if (false) {` },
  { search: `questionText = 'Select the correct letter/position for this sound:';`, replace: `questionText = getTranslation('auto.listen_and_select_position', language);` }
]);

replaceInFile('lib/generators/builders/word-position-builder.ts', [
  { search: `if (language === 'en' && targetWord.en) questionText = targetWord.en;`, replace: `questionText = getLocalizedField(targetWord, '', language);` },
  { search: `question: language === 'en' ? 'Find the word position' : 'Trouve la position du mot',`, replace: `question: getTranslation('auto.find_word_position', language),` }
]);
