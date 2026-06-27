const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');
const outputFile = path.join(__dirname, 'raw_buttons_report.txt');

function findButtons(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findButtons(filePath, fileList);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      let inComment = false;
      lines.forEach((line, index) => {
        if (line.includes('/*')) inComment = true;
        if (line.includes('*/')) inComment = false;
        
        if (!inComment && !line.trim().startsWith('//')) {
          if (line.includes('<button') && !line.includes('<Button')) {
            fileList.push(`${filePath}:${index + 1}: ${line.trim()}`);
          }
        }
      });
    }
  }
  return fileList;
}

const results = findButtons(srcDir);
fs.writeFileSync(outputFile, results.join('\n'));
console.log(`Found ${results.length} raw <button> tags. Report saved to ${outputFile}`);
