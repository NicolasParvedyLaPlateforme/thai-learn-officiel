import fs from 'fs';

const filePath = 'c:\\xampp\\htdocs\\thai-learn-officiel\\app\\lib\\exercise-generator.ts';
let content = fs.readFileSync(filePath, 'utf-8');

// Add import if not exists
if (!content.includes('getExerciseTranslation')) {
  content = "import { getExerciseTranslation, getMissingWordHint } from './translation-utils';\n" + content;
}

// Replace word/phrase question translations
content = content.replace(/language === 'en' \? \((w|p|word|phrase|item|blankWord)\.en \|\| \1\.fr\) : \1\.fr/g, 'getExerciseTranslation($1, language)');

// Replace missing word hints
content = content.replace(/const missingWordFr = language === 'en' \? \(blankWord\.en \|\| blankWord\.fr\) : blankWord\.fr;\n\s*const blankHint = language === 'en' \? `\(Missing: \$\{missingWordFr\}\)` : `\(Mot manquant : \$\{missingWordFr\}\)`;/g, 'const missingWordFr = getExerciseTranslation(blankWord, language);\n               const blankHint = getMissingWordHint(missingWordFr, language);');

// Replace "Match the pairs"
content = content.replace(/language === 'en' \? 'Match the pairs' : 'Reliez les paires correspondantes'/g, "(language === 'en' ? 'Match the pairs' : language === 'fr' ? 'Reliez les paires correspondantes' : 'Match the pairs')");

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Replaced successfully');
