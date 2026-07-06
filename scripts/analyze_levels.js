const fs = require('fs');
['level0.ts', 'level1.ts', 'level2.ts', 'level3.ts', 'level4-to-6.ts', 'level7-to-9.ts'].forEach(file => {
  const content = fs.readFileSync('c:/xampp/htdocs/thai-learn-officiel/src/lib/generators/levels/' + file, 'utf8');
  console.log('--- ' + file + ' ---');
  const matches = content.match(/type: ['\"][a-zA-Z-]+['\"]/g) || [];
  console.log([...new Set(matches)].join(', '));
  if(content.includes('phrases')) console.log('Uses phrases');
  if(content.includes('words')) console.log('Uses words');
});
