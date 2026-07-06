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

// DetectiveGame.tsx
addTranslation('detective.find_objects', {
  fr: "Trouve les {count} objets cachés dans l'image.",
  en: "Find {count} hidden objects in the image.",
  de: "Finde {count} versteckte Objekte im Bild.",
  es: "Encuentra {count} objetos ocultos en la imagen.",
  it: "Trova {count} oggetti nascosti nell'immagine."
});

// RewardClient.tsx
addTranslation('reward.coins', {
  fr: 'Pièces', en: 'Coins', de: 'Münzen', es: 'Monedas', it: 'Monete'
});

// SpeakResultScreen.tsx, ResultScreen.tsx, NextResultScreen.tsx
addTranslation('result.time', {
  fr: 'Temps', en: 'Time', de: 'Zeit', es: 'Tiempo', it: 'Tempo'
});
addTranslation('result.completion', {
  fr: 'Complété à', en: 'Completion', de: 'Abgeschlossen', es: 'Completado', it: 'Completamento'
});
addTranslation('result.retry', {
  fr: 'Refaire', en: 'Retry', de: 'Wiederholen', es: 'Reintentar', it: 'Riprova'
});

addTranslation('detective.found_all', {
  fr: 'Tu as trouvé les {count} objets avec {mistakes} erreurs.',
  en: 'You found all {count} objects with {mistakes} mistakes.',
  de: 'Du hast alle {count} Objekte mit {mistakes} Fehlern gefunden.',
  es: 'Has encontrado todos los {count} objetos con {mistakes} errores.',
  it: 'Hai trovato tutti i {count} oggetti con {mistakes} errori.'
});

// BottomNav.tsx
addTranslation('nav.learn', {
  fr: 'Apprendre', en: 'Learn', de: 'Lernen', es: 'Aprender', it: 'Impara'
});

// Hints.tsx
addTranslation('hints.analyze_tone', {
  fr: 'Analyser le Ton', en: 'Analyze Tone', de: 'Ton analysieren', es: 'Analizar tono', it: 'Analizza tono'
});

// SpeakingConfigModal.tsx
addTranslation('speaking.accuracy_required', {
  fr: 'Précision de prononciation requise', en: 'Required Pronunciation Accuracy', de: 'Erforderliche Aussprachegenauigkeit', es: 'Precisión de pronunciación requerida', it: 'Precisione di pronuncia richiesta'
});
addTranslation('speaking.lenient', {
  fr: '50% (Tolérant)', en: '50% (Lenient)', de: '50% (Tolerant)', es: '50% (Indulgente)', it: '50% (Indulgente)'
});
addTranslation('speaking.strict', {
  fr: '80% (Strict)', en: '80% (Strict)', de: '80% (Streng)', es: '80% (Estricto)', it: '80% (Rigoroso)'
});
addTranslation('speaking.with_help', {
  fr: '100% (Avec aide)', en: '100% (With Help)', de: '100% (Mit Hilfe)', es: '100% (Con ayuda)', it: '100% (Con aiuto)'
});
addTranslation('speaking.ultimate', {
  fr: '100% (Ultime)', en: '100% (Ultimate)', de: '100% (Ultimativ)', es: '100% (Definitivo)', it: '100% (Estremo)'
});

// PathLessonModal.tsx
addTranslation('path.start_assessment', {
  fr: 'Commencer le bilan', en: 'Start Assessment', de: 'Bewertung starten', es: 'Iniciar evaluación', it: 'Inizia valutazione'
});
addTranslation('path.timed_assessment', {
  fr: 'Évaluation chronométrée', en: 'Timed Assessment', de: 'Zeitgesteuerte Bewertung', es: 'Evaluación cronometrada', it: 'Valutazione a tempo'
});
addTranslation('path.assessment_title', {
  fr: 'BILAN', en: 'ASSESSMENT', de: 'BEWERTUNG', es: 'EVALUACIÓN', it: 'VALUTAZIONE'
});
addTranslation('path.full_level', {
  fr: 'NIVEAU ENTIER', en: 'FULL LEVEL', de: 'GANGES LEVEL', es: 'NIVEL COMPLETO', it: 'LIVELLO INTERO'
});
addTranslation('path.part', {
  fr: 'PARTIE {index}', en: 'PART {index}', de: 'TEIL {index}', es: 'PARTE {index}', it: 'PARTE {index}'
});
addTranslation('path.details', {
  fr: 'DÉTAILS', en: 'DETAILS', de: 'DETAILS', es: 'DETALLES', it: 'DETTAGLI'
});

// ToneAnalyzerContent.tsx
addTranslation('tone.mid_tone', { fr: 'Ton Moyen', en: 'Mid Tone', de: 'Mittlerer Ton', es: 'Tono medio', it: 'Tono medio' });
addTranslation('tone.low_tone', { fr: 'Ton Bas', en: 'Low Tone', de: 'Tiefer Ton', es: 'Tono bajo', it: 'Tono basso' });
addTranslation('tone.falling_tone', { fr: 'Ton Descendant', en: 'Falling Tone', de: 'Fallender Ton', es: 'Tono descendente', it: 'Tono discendente' });
addTranslation('tone.high_tone', { fr: 'Ton Haut', en: 'High Tone', de: 'Hoher Ton', es: 'Tono alto', it: 'Tono alto' });
addTranslation('tone.rising_tone', { fr: 'Ton Montant', en: 'Rising Tone', de: 'Steigender Ton', es: 'Tono ascendente', it: 'Tono ascendente' });
addTranslation('tone.high_class', { fr: 'Classe Haute', en: 'High Class', de: 'Hohe Klasse', es: 'Clase alta', it: 'Classe alta' });
addTranslation('tone.mid_class', { fr: 'Classe Moyenne', en: 'Mid Class', de: 'Mittlere Klasse', es: 'Clase media', it: 'Classe media' });
addTranslation('tone.low_class', { fr: 'Classe Basse', en: 'Low Class', de: 'Tiefe Klasse', es: 'Clase baja', it: 'Classe bassa' });
addTranslation('tone.no_mark', { fr: 'Aucune marque', en: 'No mark', de: 'Kein Zeichen', es: 'Sin marca', it: 'Nessun segno' });
addTranslation('tone.rule', { fr: "L'équation", en: 'The Rule', de: 'Die Regel', es: 'La regla', it: 'La regola' });
addTranslation('tone.consonant', { fr: 'Consonne', en: 'Consonant', de: 'Konsonant', es: 'Consonante', it: 'Consonante' });
addTranslation('tone.vowel', { fr: 'Voyelle', en: 'Vowel', de: 'Vokal', es: 'Vocal', it: 'Vocale' });
addTranslation('tone.short', { fr: 'Courte', en: 'Short', de: 'Kurz', es: 'Corta', it: 'Corta' });
addTranslation('tone.long', { fr: 'Longue', en: 'Long', de: 'Lang', es: 'Larga', it: 'Lunga' });
addTranslation('tone.live_syllable', { fr: 'Syllabe Vivante', en: 'Live Syllable', de: 'Lebendige Silbe', es: 'Sílaba viva', it: 'Sillaba viva' });
addTranslation('tone.dead_syllable', { fr: 'Syllabe Morte', en: 'Dead Syllable', de: 'Tote Silbe', es: 'Sílaba muerta', it: 'Sillaba morta' });
addTranslation('tone.mark', { fr: 'Marque', en: 'Mark', de: 'Zeichen', es: 'Marca', it: 'Segno' });
addTranslation('tone.result', { fr: 'Résultat', en: 'Result', de: 'Ergebnis', es: 'Resultado', it: 'Risultato' });
addTranslation('tone.has_mark', { fr: ', et elle possède la marque de ton {mark}.', en: ', and it has the tone mark {mark}.', de: ', und sie hat das Tonzeichen {mark}.', es: ', y tiene la marca de tono {mark}.', it: ', e ha il segno di tono {mark}.' });
addTranslation('tone.without_mark', { fr: ' sans aucune marque de ton.', en: ' without any tone mark.', de: ' ohne Tonzeichen.', es: ' sin ninguna marca de tono.', it: ' senza alcun segno di tono.' });
addTranslation('tone.rule_explanation', { fr: 'Selon les règles des tons thaïlandais, cette combinaison donne un ', en: 'According to Thai tone rules, this combination results in a ', de: 'Nach den thailändischen Tonregeln ergibt diese Kombination einen ', es: 'Según las reglas de tono tailandesas, esta combinación da como resultado un ', it: 'Secondo le regole tonali thailandesi, questa combinazione produce un ' });
addTranslation('tone.title', { fr: 'Calculateur de Tons', en: 'Tone Analyzer', de: 'Tonanalysator', es: 'Analizador de tono', it: 'Analizzatore di tono' });
addTranslation('tone.select_syllable', { fr: 'Sélectionnez une syllabe à analyser', en: 'Select a syllable to analyze', de: 'Wählen Sie eine Silbe zur Analyse', es: 'Seleccione una sílaba para analizar', it: 'Seleziona una sillaba da analizzare' });
addTranslation('tone.build_word', { fr: 'Construisez votre mot lettre par lettre', en: 'Build your word letter by letter', de: 'Bauen Sie Ihr Wort Buchstabe für Buchstabe', es: 'Construya su palabra letra por letra', it: 'Costruisci la tua parola lettera per lettera' });

// Replace JSON files
for (const lang in jsonFiles) {
  fs.writeFileSync(path.join(localesDir, `${lang}.json`), JSON.stringify(jsonFiles[lang], null, 2));
  console.log(`Updated ${lang}.json`);
}

// Now replace text in files
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

replaceInFile('app/reward/RewardClient.tsx', [
  { search: `{language === 'en' ? 'Coins' : 'Pièces'}`, replace: `{getTranslation('reward.coins', language)}` }
]);

replaceInFile('components/layout/BottomNav.tsx', [
  { search: `{language === 'en' ? 'Learn' : 'Apprendre'}`, replace: `{getTranslation('nav.learn', language)}` }
]);

replaceInFile('components/learn/Hints.tsx', [
  { search: `title={language === 'en' ? 'Analyze Tone' : 'Analyser le Ton'}`, replace: `title={getTranslation('hints.analyze_tone', language)}` }
]);

replaceInFile('components/modals/SpeakingConfigModal.tsx', [
  { search: `{language === 'en' ? 'Required Pronunciation Accuracy' : 'Précision de prononciation requise'}`, replace: `{getTranslation('speaking.accuracy_required', language)}` },
  { search: `{language === 'en' ? '50% (Lenient)' : '50% (Tolérant)'}`, replace: `{getTranslation('speaking.lenient', language)}` },
  { search: `{language === 'en' ? '80% (Strict)' : '80% (Strict)'}`, replace: `{getTranslation('speaking.strict', language)}` },
  { search: `{language === 'en' ? '100% (With Help)' : '100% (Avec aide)'}`, replace: `{getTranslation('speaking.with_help', language)}` },
  { search: `{language === 'en' ? '100% (Ultimate)' : '100% (Ultime)'}`, replace: `{getTranslation('speaking.ultimate', language)}` }
]);

replaceInFile('components/next/NextResultScreen.tsx', [
  { search: `{language === 'en' ? 'Time' : 'Temps'}`, replace: `{getTranslation('result.time', language)}` }
]);

replaceInFile('components/lesson/ResultScreen.tsx', [
  { search: `language === "en" ? "Retry" : "Refaire"`, replace: `getTranslation('result.retry', language)` },
  { search: `{language === "en" ? \`Completion: \${percentage}%\` : \`Complété à : \${percentage}%\`}`, replace: `{getTranslation('result.completion', language)}: {percentage}%` },
  { search: `{language === "en" ? \`Time: \${formatTime(timeTakenSec)}\` : \`Temps : \${formatTime(timeTakenSec)}\`}`, replace: `{getTranslation('result.time', language)}: {formatTime(timeTakenSec)}` }
]);

replaceInFile('app/speak/lesson/[id]/SpeakResultScreen.tsx', [
  { search: `{language === "en" ? \`Time: \${formatTime(elapsedTimeSec)}\` : \`Temps : \${formatTime(elapsedTimeSec)}\`}`, replace: `{getTranslation('result.time', language)}: {formatTime(elapsedTimeSec)}` }
]);

replaceInFile('components/detective/DetectiveClientWrapper.tsx', [
  { search: `{language === 'en' ? level.titleEn : level.title}`, replace: `{getLocalizedField(level, 'title', language)}` }
]);

replaceInFile('components/detective/DetectiveGame.tsx', [
  { search: `{language === 'en' ? \`Find \${level.objects?.length || 0} hidden objects in the image.\` : \`Trouve les \${level.objects?.length || 0} objets cachés dans l'image.\`}`, replace: `{getTranslation('detective.find_objects', language).replace('{count}', (level.objects?.length || 0).toString())}` },
  { search: `{language === 'en' ? \`You found all \${level.objects?.length || 0} objects with \${mistakes} mistakes.\` : \`Tu as trouvé les \${level.objects?.length || 0} objets avec \${mistakes} erreurs.\`}`, replace: `{getTranslation('detective.found_all', language).replace('{count}', (level.objects?.length || 0).toString()).replace('{mistakes}', mistakes.toString())}` }
]);

replaceInFile('components/path-ui/PathLessonModal.tsx', [
  { search: `{isBilanLesson ? (language === 'en' ? 'Start Assessment' : 'Commencer le bilan') : getTranslation('auto.start_lesson', language)}`, replace: `{isBilanLesson ? getTranslation('path.start_assessment', language) : getTranslation('auto.start_lesson', language)}` },
  { search: `{language === 'en' ? 'Timed Assessment' : 'Évaluation chronométrée'}`, replace: `{getTranslation('path.timed_assessment', language)}` },
  { search: `? (isBilanLesson ? (language === 'en' ? 'ASSESSMENT' : 'BILAN') : (playFullLevel ? (language === 'en' ? 'FULL LEVEL' : "NIVEAU ENTIER") : totalParts > 1 ? (language === 'en' ? \`PART \${selectedPartIndex + 1}\` : \`PARTIE \${selectedPartIndex + 1}\`) : (language === 'en' ? 'DETAILS' : "DÉTAILS")))`, replace: `? (isBilanLesson ? getTranslation('path.assessment_title', language) : (playFullLevel ? getTranslation('path.full_level', language) : totalParts > 1 ? getTranslation('path.part', language).replace('{index}', (selectedPartIndex + 1).toString()) : getTranslation('path.details', language)))` }
]);

replaceInFile('components/tone-analyzer/ToneAnalyzerContent.tsx', [
  { search: `mid: language === 'en' ? 'Mid Tone' : 'Ton Moyen',`, replace: `mid: getTranslation('tone.mid_tone', language),` },
  { search: `low: language === 'en' ? 'Low Tone' : 'Ton Bas',`, replace: `low: getTranslation('tone.low_tone', language),` },
  { search: `falling: language === 'en' ? 'Falling Tone' : 'Ton Descendant',`, replace: `falling: getTranslation('tone.falling_tone', language),` },
  { search: `high: language === 'en' ? 'High Tone' : 'Ton Haut',`, replace: `high: getTranslation('tone.high_tone', language),` },
  { search: `rising: language === 'en' ? 'Rising Tone' : 'Ton Montant'`, replace: `rising: getTranslation('tone.rising_tone', language)` },
  { search: `if (cls === 'high') return language === 'en' ? 'High Class' : 'Classe Haute';`, replace: `if (cls === 'high') return getTranslation('tone.high_class', language);` },
  { search: `if (cls === 'mid') return language === 'en' ? 'Mid Class' : 'Classe Moyenne';`, replace: `if (cls === 'mid') return getTranslation('tone.mid_class', language);` },
  { search: `if (cls === 'low') return language === 'en' ? 'Low Class' : 'Classe Basse';`, replace: `if (cls === 'low') return getTranslation('tone.low_class', language);` },
  { search: `if (mark === 'none') return language === 'en' ? 'No mark' : 'Aucune marque';`, replace: `if (mark === 'none') return getTranslation('tone.no_mark', language);` },
  { search: `{language === 'en' ? 'The Rule' : 'L\\'équation'}`, replace: `{getTranslation('tone.rule', language)}` },
  { search: `{language === 'en' ? 'Consonant' : 'Consonne'}`, replace: `{getTranslation('tone.consonant', language)}` },
  { search: `{language === 'en' ? 'Vowel' : 'Voyelle'}`, replace: `{getTranslation('tone.vowel', language)}` },
  { search: `{analysis.vowelLength === 'short' ? (language === 'en' ? 'Short' : 'Courte') : (language === 'en' ? 'Long' : 'Longue')}`, replace: `{analysis.vowelLength === 'short' ? getTranslation('tone.short', language) : getTranslation('tone.long', language)}` },
  { search: `{analysis.endingType === 'live' ? (language === 'en' ? 'Live Syllable' : 'Syllabe Vivante') : (language === 'en' ? 'Dead Syllable' : 'Syllabe Morte')}`, replace: `{analysis.endingType === 'live' ? getTranslation('tone.live_syllable', language) : getTranslation('tone.dead_syllable', language)}` },
  { search: `{language === 'en' ? 'Mark' : 'Marque'}`, replace: `{getTranslation('tone.mark', language)}` },
  { search: `{language === 'en' ? 'Result' : 'Résultat'}`, replace: `{getTranslation('tone.result', language)}` },
  { search: `? (language === 'en' ? \`, and it has the tone mark \${translateMark(analysis.toneMark)}.\` : \`, et elle possède la marque de ton \${translateMark(analysis.toneMark)}.\`)`, replace: `? getTranslation('tone.has_mark', language).replace('{mark}', translateMark(analysis.toneMark))` },
  { search: `: (language === 'en' ? ' without any tone mark.' : ' sans aucune marque de ton.')}`, replace: `: getTranslation('tone.without_mark', language)}` },
  { search: `{language === 'en' ? 'According to Thai tone rules, this combination results in a ' : 'Selon les règles des tons thaïlandais, cette combinaison donne un '}`, replace: `{getTranslation('tone.rule_explanation', language)}` },
  { search: `{language === 'en' ? 'Tone Analyzer' : 'Calculateur de Tons'}`, replace: `{getTranslation('tone.title', language)}` },
  { search: `{language === 'en' ? 'Select a syllable to analyze' : 'Sélectionnez une syllabe à analyser'}`, replace: `{getTranslation('tone.select_syllable', language)}` },
  { search: `{language === 'en' ? 'Build your word letter by letter' : 'Construisez votre mot lettre par lettre'}`, replace: `{getTranslation('tone.build_word', language)}` }
]);

