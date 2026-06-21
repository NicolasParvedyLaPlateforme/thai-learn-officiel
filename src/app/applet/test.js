import { Intl } from 'globalthis/implementation'; // wait just globalThis
const text = "สวัสดีครับ";
const segmenter = new (globalThis).Intl.Segmenter('th', { granularity: 'word' });
let offset = 0;
const bounds = [];
for (const segment of segmenter.segment(text)) {
  offset += segment.segment.length;
  bounds.push(offset);
  console.log(segment.segment, segment.isWordLike);
}
console.log(bounds);
