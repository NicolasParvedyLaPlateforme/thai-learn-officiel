import { THAI_ALPHABET } from "@/data/alphabet-data";

export function analyzeDifferences(options: string[], answer: string) {
  if (options.length !== 4) return null;
  if (options.some(o => !o || o.length === 0)) return null;

  const minLen = Math.min(...options.map(o => o.length));

  let commonPrefixLen = 0;
  while (commonPrefixLen < minLen) {
    const char = options[0][commonPrefixLen];
    if (options.every(o => o[commonPrefixLen] === char)) {
      commonPrefixLen++;
    } else {
      break;
    }
  }

  let commonSuffixLen = 0;
  while (commonSuffixLen < minLen - commonPrefixLen) {
    const char = options[0][options[0].length - 1 - commonSuffixLen];
    if (options.every(o => o[o.length - 1 - commonSuffixLen] === char)) {
      commonSuffixLen++;
    } else {
      break;
    }
  }

  const diffs = options.map(o => o.substring(commonPrefixLen, o.length - commonSuffixLen));

  if (diffs.some(d => d.length === 0)) return null;
  const maxDiffLen = Math.max(...diffs.map(d => Array.from(d).length));
  if (maxDiffLen > 3) return null;

  const correctIdx = options.findIndex(o => o === answer);
  if (correctIdx === -1) return null;

  const correctDiff = diffs[correctIdx];
  let matchedLetter = null;
  for (const char of Array.from(correctDiff)) {
    matchedLetter = THAI_ALPHABET.find(a => a.letter === char);
    if (matchedLetter) break;
  }

  if (matchedLetter) {
    return {
      matchedLetter,
      commonPrefixLen,
      commonSuffixLen,
      diffs
    };
  }
  return null;
}
