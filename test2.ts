import { THAI_ALPHABET } from './src/data/alphabet-data';

const characters = ['เ', 'ด', 'ื', 'อ', 'น'];
const selectableIndices = characters
  .map((char, index) => {
    const item = THAI_ALPHABET.find(a => a.letter === char);
    return item ? index : -1;
  })
  .filter(idx => idx !== -1);

console.log('selectableIndices:', selectableIndices);

const activeIdx = 1; // 'ด'
const currentSelectableIndex = selectableIndices.indexOf(activeIdx);
console.log('currentSelectableIndex:', currentSelectableIndex);
