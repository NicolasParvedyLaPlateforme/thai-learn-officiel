import fs from 'fs';
import path from 'path';

const appDir = 'c:\\xampp\\htdocs\\thai-learn-officiel\\app';
const allFiles = fs.readdirSync(appDir, { recursive: true })
  .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'))
  .map(f => path.join(appDir, f).replace(/\\/g, '/'));

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf-8');
  if (content.includes('getTranslation(') && !content.includes('import { getTranslation }')) {
    const depth = file.substring(appDir.length).split('/').length - 2;
    let relativePath = '../'.repeat(depth) + 'hooks/useTranslation';
    if (depth <= 0) relativePath = './hooks/useTranslation';
    if (file.replace(/\\/g, '/').endsWith('useTranslation.ts')) continue;
    
    const firstImportIndex = content.indexOf('import');
    if (firstImportIndex !== -1) {
      content = content.slice(0, firstImportIndex) + `import { getTranslation } from '${relativePath}';\n` + content.slice(firstImportIndex);
    } else {
      content = `import { getTranslation } from '${relativePath}';\n` + content;
    }
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Fixed imports in ${file}`);
  }
}
