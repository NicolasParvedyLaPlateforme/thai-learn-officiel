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

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Fix actions imports
    const regex = /from\s+['"]((?:\.\.\/|\.\/)+)actions\/(.*?)['"]/g;
    content = content.replace(regex, (match, p1, p2) => {
        return `from "@/actions/${p2}"`;
    });

    // Fix the VirtualKeyboard in writing page
    if (file.replace(/\\/g, '/').includes('app/writing/page.tsx')) {
        content = content.replace('from "@/components/VirtualKeyboard"', 'from "./components/VirtualKeyboard"');
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed actions imports in:', file);
    }
});
