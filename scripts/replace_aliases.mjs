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
    
    // Pattern to catch relative imports targeting the root src folders.
    // Examples:
    // from "../../components/xxx" -> from "@/components/xxx"
    // from "../lib/xxx" -> from "@/lib/xxx"
    const regex = /from\s+['"]((?:\.\.\/|\.\/)+)(components|lib|hooks|data|locales|types)(.*?)['"]/g;
    content = content.replace(regex, (match, p1, p2, p3) => {
        return `from "@/${p2}${p3}"`;
    });

    const regexDynamic = /import\(['"]((?:\.\.\/|\.\/)+)(components|lib|hooks|data|locales|types)(.*?)['"]\)/g;
    content = content.replace(regexDynamic, (match, p1, p2, p3) => {
        return `import("@/${p2}${p3}")`;
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated:', file);
        changedCount++;
    }
});

console.log(`Successfully updated imports in ${changedCount} files.`);
