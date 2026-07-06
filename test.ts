import { analyzeSyllableContext } from './src/lib/thai-phonetics';
const characters = ['เ', 'ด', 'ื', 'อ', 'น'];
const activeAlphabetItem = { type: 'consonant', letter: 'ด' };
console.log(analyzeSyllableContext(characters, 1, activeAlphabetItem));
