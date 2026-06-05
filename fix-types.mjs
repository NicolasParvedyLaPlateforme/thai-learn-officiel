import fs from 'fs';
import path from 'path';

const appDir = 'c:\\xampp\\htdocs\\thai-learn-officiel\\app';
const allFiles = fs.readdirSync(appDir, { recursive: true })
  .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'))
  .map(f => path.join(appDir, f).replace(/\\/g, '/'));

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf-8');
  
  const newContent = content
    .replace(/language:\s*['"]fr['"]\s*\|\s*['"]en['"]/g, 'language: string')
    .replace(/language\?:\s*['"]fr['"]\s*\|\s*['"]en['"]/g, 'language?: string')
    .replace(/language:\s*['"]en['"]\s*\|\s*['"]fr['"]/g, 'language: string')
    .replace(/language\?:\s*['"]en['"]\s*\|\s*['"]fr['"]/g, 'language?: string');

  if (newContent !== content) {
    fs.writeFileSync(file, newContent, 'utf-8');
    console.log(`Fixed types in ${file}`);
  }
}
