import React from 'react';

export function ColoredPhonetic({ phonetic, charHintRegex, hideColors }: { phonetic: string; charHintRegex?: RegExp; hideColors?: boolean }) {
  // Split the phonetic string into logical syllables/words. 
  // Often separated by spaces or hyphens.
  // We want to color each syllable independently.
  
  // We can just iterate through words/syllables
  // Using a regex to detect the tonal marks
  
  // High Tone (Orange): á, í, ú, é, ó
  const highToneRegex = /[áíúéóÁÍÚÉÓ]/;
  // Low Tone (Green): à, ì, ù, è, ò, ɔ̀
  const lowToneRegex = /[àìùèòÀÌÙÈÒ]/; // plus we might have unicode combining marks, let's also check for decomposed
  // Falling Tone (Red): â, î, û, ê, ô
  const fallingToneRegex = /[âîûêôÂÎÛÊÔ]/;
  // Rising Tone (Blue): ǎ, ǐ, ǔ, ě, ǒ, sɔ̌ng
  const risingToneRegex = /[ǎǐǔěǒǍǏǓĚǑ]/;

  // Let's also check for combining diacritical marks since "ɔ̌" might just be "ɔ" + \u030C
  // Low Tone: \u0300
  // High Tone: \u0301
  // Falling Tone: \u0302
  // Rising Tone: \u030C

  const parseToneClass = (word: string) => {
    if (hideColors) return "text-slate-500";
    if (highToneRegex.test(word) || /\u0301/.test(word)) return "text-orange-500";
    if (fallingToneRegex.test(word) || /\u0302/.test(word)) return "text-red-500";
    if (risingToneRegex.test(word) || /\u030C/.test(word)) return "text-blue-500";
    if (lowToneRegex.test(word) || /\u0300/.test(word)) return "text-green-600";
    // Default Mid Tone
    return "text-slate-500";
  };

  // We should split by hyphens and spaces to color each part, but we want to retain the separators.
  
  // Split by (\s|-)
  const tokens = phonetic.split(/(\s|-)/g);

  // Helper to render token with optional regex highlighting
  const renderToken = (token: string, toneClass: string, key: number) => {
    if (!charHintRegex) {
      return <span key={key} className={toneClass}>{token}</span>;
    }

    // Try to match the regex within the token
    // We only want to highlight the first occurrence or specific occurrences based on the regex
    // Since RegExp might have global flag or not, let's just do a simple replacement
    // React elements need to be built from split strings
    const match = token.match(charHintRegex);
    if (!match) {
      return <span key={key} className={toneClass}>{token}</span>;
    }

    const startIdx = match.index!;
    const endIdx = startIdx + match[0].length;
    
    // We also make the highlight orange as requested
    return (
      <span key={key} className={toneClass}>
        {token.substring(0, startIdx)}
        <span className="bg-orange-200 text-orange-700 px-[2px] rounded font-bold border border-orange-300 shadow-sm">{token.substring(startIdx, endIdx)}</span>
        {token.substring(endIdx)}
      </span>
    );
  };

  return (
    <span className="font-medium font-sans">
      {tokens.map((token, index) => {
        if (token === '-' || token === ' ') {
          return <span key={index} className="text-slate-400">{token}</span>;
        }
        return renderToken(token, parseToneClass(token), index);
      })}
    </span>
  );
}
