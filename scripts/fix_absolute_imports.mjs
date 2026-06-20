import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
                results = results.concat(walk(file));
            }
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src');
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace @/app/lib/ => @/lib/, @/app/components/ => @/components/, etc
    const regex = /['"]@\/app\/(components|lib|hooks|data|locales|types|actions)(.*?)['"]/g;
    content = content.replace(regex, '"@/$1$2"');

    // also replace from '@/app/actions' => '@/actions'
    const regexActions = /['"]@\/app\/actions(.*?)['"]/g;
    content = content.replace(regexActions, '"@/actions$1"');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed absolute paths in:', file);
        changedCount++;
    }
});

console.log(`Successfully updated absolute imports in ${changedCount} files.`);
