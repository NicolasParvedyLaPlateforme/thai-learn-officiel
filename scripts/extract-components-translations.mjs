import fs from 'fs';
import path from 'path';

const appDir = 'c:\\xampp\\htdocs\\thai-learn-officiel\\app';
const allFiles = fs.readdirSync(appDir, { recursive: true })
  .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'))
  .map(f => path.join(appDir, f).replace(/\\/g, '/'));

let enDict = JSON.parse(fs.readFileSync(`${appDir}/locales/en.json`, 'utf-8'));
let frDict = JSON.parse(fs.readFileSync(`${appDir}/locales/fr.json`, 'utf-8'));
let deDict = JSON.parse(fs.readFileSync(`${appDir}/locales/de.json`, 'utf-8'));
let esDict = JSON.parse(fs.readFileSync(`${appDir}/locales/es.json`, 'utf-8'));
let itDict = JSON.parse(fs.readFileSync(`${appDir}/locales/it.json`, 'utf-8'));

function generateKey(enStr) {
  return enStr.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 30).replace(/^_+|_+$/g, '');
}

const regexStr = /language\s*===\s*['"]en['"]\s*\?\s*(['"`])((?:(?!\1)[^\\]|\\.)*)\1\s*:\s*(['"`])((?:(?!\3)[^\\]|\\.)*)\3/g;
let counter = 0;

for (const file of allFiles) {
  if (file.includes('DesktopSidebarLeft.tsx') || file.includes('BottomNav.tsx') || file.includes('QuestionArea.tsx')) continue;

  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;

  content = content.replace(regexStr, (match, q1, enText, q3, frText) => {
    if (enText.includes('${') || frText.includes('${')) return match;
    
    // Unescape strings for JSON
    let cleanEn = enText.replace(/\\(['"`])/g, '$1');
    let cleanFr = frText.replace(/\\(['"`])/g, '$1');

    let baseKey = generateKey(cleanEn);
    if (!baseKey) baseKey = `auto_key_${++counter}`;
    let key = `auto.${baseKey}`;
    
    while (enDict[key] && enDict[key] !== cleanEn) {
      key = `${key}_${++counter}`;
    }

    enDict[key] = cleanEn;
    frDict[key] = cleanFr;
    if (deDict[key] === undefined) deDict[key] = "";
    if (esDict[key] === undefined) esDict[key] = "";
    if (itDict[key] === undefined) itDict[key] = "";

    changed = true;
    return `getTranslation('${key}', language)`;
  });

  if (changed) {
    if (!content.includes('getTranslation')) {
      const depth = file.substring(appDir.length).split('/').length - 2;
      let relativePath = '../'.repeat(depth) + 'hooks/useTranslation';
      if (depth === 0) relativePath = './hooks/useTranslation';
      
      const firstImportIndex = content.indexOf('import');
      if (firstImportIndex !== -1) {
        content = content.slice(0, firstImportIndex) + `import { getTranslation } from '${relativePath}';\n` + content.slice(firstImportIndex);
      } else {
        content = `import { getTranslation } from '${relativePath}';\n` + content;
      }
    }
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
}

fs.writeFileSync(`${appDir}/locales/en.json`, JSON.stringify(enDict, null, 2));
fs.writeFileSync(`${appDir}/locales/fr.json`, JSON.stringify(frDict, null, 2));
fs.writeFileSync(`${appDir}/locales/de.json`, JSON.stringify(deDict, null, 2));
fs.writeFileSync(`${appDir}/locales/es.json`, JSON.stringify(esDict, null, 2));
fs.writeFileSync(`${appDir}/locales/it.json`, JSON.stringify(itDict, null, 2));

console.log('Script completed.');
