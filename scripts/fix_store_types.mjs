import fs from 'fs';
import path from 'path';

const storeDir = 'src/lib/store';
const files = fs.readdirSync(storeDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
    const filePath = path.join(storeDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace @/types with ./types for files in store that need ProgressState
    if (content.includes('ProgressState') && content.includes('@/types')) {
        content = content.replace(/from\s+['"]@\/types['"]/g, 'from "./types"');
    }

    // Wait, the regex replaced `./types` with `@/types`.
    // Does store.ts import from `./types`? Yes, it did.

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed types import in:', filePath);
    }
});
