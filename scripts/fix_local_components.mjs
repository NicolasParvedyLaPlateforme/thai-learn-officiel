import fs from 'fs';
import path from 'path';

function replaceInFile(filePath, search, replacement) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    // can be string or regex
    if (typeof search === 'string') {
        content = content.split(search).join(replacement);
    } else {
        content = content.replace(search, replacement);
    }
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed:', filePath);
    }
}

// 1. Fix syncProgress.ts
replaceInFile('src/actions/syncProgress.ts', /from ['"]@\/app\/lib\/(.*?)['"]/g, 'from "@/lib/$1"');

// 2. Fix local component imports in pages
replaceInFile('src/app/alphabet/page.tsx', 'from "@/components/AlphabetClientPage"', 'from "./components/AlphabetClientPage"');
replaceInFile('src/app/alphabet/lesson/[id]/page.tsx', 'from "@/components/AlphabetLessonClientPage"', 'from "./components/AlphabetLessonClientPage"');
replaceInFile('src/app/conversations/[id]/page.tsx', 'from "@/components/ConversationClientPage"', 'from "./components/ConversationClientPage"');
replaceInFile('src/app/lesson/[id]/page.tsx', 'from "@/components/LessonClientPage"', 'from "./components/LessonClientPage"');
replaceInFile('src/app/writing/page.tsx', 'from "@/components/VirtualKeyboard"', 'from "./components/VirtualKeyboard"');
