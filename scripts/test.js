const text = "ขอบคุณครับ";
const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
const segments = Array.from(segmenter.segment(text));
console.log(segments);

const components = ["ข", "อ", "บ", "คุ", "ณ", "ค", "รั", "บ"];

let selectedLen = 0; // they haven't typed anything
let currentStrLen = components.slice(0, selectedLen).join('').length;

let currentWord = segments.find(s => s.index <= currentStrLen && s.index + s.segment.length > currentStrLen) || segments[segments.length - 1];

console.log('typed 0:', currentWord.segment);

selectedLen = 4; // typed ข อ บ คุ
currentStrLen = components.slice(0, selectedLen).join('').length;
currentWord = segments.find(s => s.index <= currentStrLen && s.index + s.segment.length > currentStrLen) || segments[segments.length - 1];

console.log('typed 4:', currentWord.segment);

selectedLen = 5; // typed ขอบคุณ
currentStrLen = components.slice(0, selectedLen).join('').length;
currentWord = segments.find(s => s.index <= currentStrLen && s.index + s.segment.length > currentStrLen) || segments[segments.length - 1];

console.log('typed 5:', currentWord.segment); // Should be ครับ
