export interface CharHint {
  highlightRegex?: RegExp;
  note: string;
  noteEn: string;
}

function isThaiConsonant(char: string) {
  return /[\u0E01-\u0E2E]/.test(char);
}

export function isFinalConsonant(allChars: string[], index: number): boolean {
  const char = allChars[index];
  if (!char || !isThaiConsonant(char)) return false;
  
  // If followed by Garan, not final (silent)
  if (index + 1 < allChars.length && allChars[index + 1] === '์') return false;

  // Sometimes 'ห' is a silent tone modifier (ห นำ)
  // If it's 'ห' and followed by low sonorant consonant, it's initial.
  if (char === 'ห' && index + 1 < allChars.length) {
    const nextChar = allChars[index + 1];
    if (['น','ม','ล','ง','ว','ร','ย'].includes(nextChar)) return false;
  }

  // If it's the very last character, it's final
  if (index === allChars.length - 1) return true;

  const nextChar = allChars[index + 1];

  // If next is a prepended vowel, this one must be the end of the previous syllable
  if (['เ', 'แ', 'โ', 'ไ', 'ใ'].includes(nextChar)) return true;

  const topBottomPostVowelsTones = ['ะ', 'า', 'ิ', 'ี', 'ึ', 'ื', 'ุ', 'ู', '่', '้', '๊', '๋', '็', 'ำ', 'ั'];
  if (topBottomPostVowelsTones.includes(nextChar)) {
    return false; // It's an initial consonant
  }

  if (isThaiConsonant(nextChar)) {
    if (index === 0) return false;
    const prevChar = allChars[index - 1];
    if (topBottomPostVowelsTones.includes(prevChar)) {
      return true;
    }
    if (['เ', 'แ', 'โ', 'ไ', 'ใ'].includes(prevChar)) {
      return false; 
    }
    return true;
  }

  return false;
}

export function getCharacterHint(allChars: string[], currentIndex: number): CharHint {
  const char = allChars[currentIndex];
  const prevChar = currentIndex > 0 ? allChars[currentIndex - 1] : undefined;
  const nextChar = currentIndex < allChars.length - 1 ? allChars[currentIndex + 1] : undefined;

  // basic rules for Thai alphabet mapping
  const code = char.charCodeAt(0);

  // Vowels
  if (char === 'ะ') return { highlightRegex: /a|à|á|â|ǎ/i, note: "Voyelle 'a' courte. Se prononce [a].", noteEn: "Short 'a' vowel. Pronounced [a]." };
  if (char === 'า') return { highlightRegex: /aa|àà|áá|ââ|ǎǎ/i, note: "Voyelle 'a' longue. Se prononce [aa].", noteEn: "Long 'a' vowel. Pronounced [aa]." };
  if (char === 'ิ') return { highlightRegex: /i|ì|í|î|ǐ/i, note: "Voyelle 'i' courte. Se prononce [i].", noteEn: "Short 'i' vowel. Pronounced [i]." };
  if (char === 'ี') return { highlightRegex: /ii|ìì|íí|îî|ǐǐ/i, note: "Voyelle 'i' longue. Se prononce [ii].", noteEn: "Long 'i' vowel. Pronounced [ii]." };
  if (char === 'ึ') return { highlightRegex: /ue|ùe|úe|ûe|ǔe/i, note: "Voyelle 'ue' courte. Se prononce [ue].", noteEn: "Short 'ue' vowel. Pronounced [ue]." };
  if (char === 'ื') return { highlightRegex: /uee|ùee|úee|ûee|ǔee/i, note: "Voyelle 'ue' longue. Se prononce [uee].", noteEn: "Long 'ue' vowel. Pronounced [uee]." };
  if (char === 'ุ') return { highlightRegex: /u(?!e)|ù(?!e)|ú(?!e)|û(?!e)|ǔ(?!e)/i, note: "Voyelle 'u' courte. Se prononce [u].", noteEn: "Short 'u' vowel. Pronounced [u]." };
  if (char === 'ู') return { highlightRegex: /uu|ùù|úú|ûû|ǔǔ/i, note: "Voyelle 'u' longue. Se prononce [uu].", noteEn: "Long 'uu' vowel. Pronounced [uu]." };
  if (char === 'เ') return { highlightRegex: /e|è|é|ê|ě/i, note: "Voyelle 'e'. Placée avant la consonne mais prononcée après.", noteEn: "Vowel 'e'. Placed before the consonant but pronounced after." };
  if (char === 'แ') return { highlightRegex: /ae|àe|áe|âe|ǎe|ɛ|ɛ̀|ɛ́|ɛ̂|ɛ̌/i, note: "Voyelle 'ae'. Placée avant la consonne mais prononcée après.", noteEn: "Vowel 'ae'. Placed before the consonant but pronounced after." };
  if (char === 'โ') return { highlightRegex: /o|ò|ó|ô|ǒ/i, note: "Voyelle 'o'. Placée avant la consonne mais prononcée après.", noteEn: "Vowel 'o'. Placed before the consonant but pronounced after." };
  if (char === 'ไ') return { highlightRegex: /ai|ài|ái|âi|ǎi/i, note: "Voyelle 'ai' (mai malai). Placée avant.", noteEn: "Vowel 'ai' (mai malai). Placed before." };
  if (char === 'ใ') return { highlightRegex: /ai|ài|ái|âi|ǎi/i, note: "Voyelle 'ai' (mai muan). Placée avant.", noteEn: "Vowel 'ai' (mai muan). Placed before." };
  if (char === 'ำ') return { highlightRegex: /am|àm|ám|âm|ǎm/i, note: "Voyelle 'am'. Se prononce [am].", noteEn: "Vowel 'am'. Pronounced [am]." };
  if (char === 'ั') return { highlightRegex: /a|à|á|â|ǎ/i, note: "Voyelle 'a' modifiée (mai han-akat). Utilisée quand il y a une consonne finale.", noteEn: "Modified 'a' vowel (mai han-akat). Used with a final consonant." };
  if (char === '็') return { highlightRegex: /./i, note: "Raccourcit la voyelle (mai taikhu).", noteEn: "Shortens the vowel (mai taikhu)." };

  // Tone Marks (Modifier)
  if (char === '่') return { highlightRegex: /[aieuoàèìòùâêîôûáéíóúǎěǐǒǔ]/i, note: "Marque de ton (mai ek). Modifie la prononciation globale ou le ton de la syllabe.", noteEn: "Tone mark (mai ek). Modifies the overall pronunciation or tone of the syllable." };
  if (char === '้') return { highlightRegex: /[aieuoàèìòùâêîôûáéíóúǎěǐǒǔ]/i, note: "Marque de ton (mai tho). Modifie la prononciation globale ou le ton de la syllabe.", noteEn: "Tone mark (mai tho). Modifies the overall pronunciation or tone of the syllable." };
  if (char === '๊') return { highlightRegex: /[aieuoàèìòùâêîôûáéíóúǎěǐǒǔ]/i, note: "Marque de ton (mai tri). Modifie la prononciation globale ou le ton de la syllabe.", noteEn: "Tone mark (mai tri). Modifies the overall pronunciation or tone of the syllable." };
  if (char === '๋') return { highlightRegex: /[aieuoàèìòùâêîôûáéíóúǎěǐǒǔ]/i, note: "Marque de ton (mai cattawa). Modifie la prononciation globale ou le ton de la syllabe.", noteEn: "Tone mark (mai cattawa). Modifies the overall pronunciation or tone of the syllable." };
  if (char === '์') return { highlightRegex: /./i, note: "Rend la consonne muette (garan).", noteEn: "Makes the consonant silent (garan)." };

  const final = isFinalConsonant(allChars, currentIndex);

  if (final) {
    if (['ด', 'จ', 'ช', 'ซ', 'ฎ', 'ฏ', 'ฐ', 'ฑ', 'ฒ', 'ต', 'ถ', 'ท', 'ธ', 'ศ', 'ษ', 'ส'].includes(char)) {
      return { highlightRegex: /dt|t(?!h)/i, note: `Consonne finale (Mae Kot). La lettre '${char}' se prononce [t] en fin de syllabe.`, noteEn: `Final consonant (Mae Kot). The letter '${char}' is pronounced [t] at the end of a syllable.` };
    }
    if (['น', 'ญ', 'ณ', 'ร', 'ล', 'ฬ'].includes(char)) {
      return { highlightRegex: /n(?!g)/i, note: `Consonne finale (Mae Kon). La lettre '${char}' se prononce [n] en fin de syllabe.`, noteEn: `Final consonant (Mae Kon). The letter '${char}' is pronounced [n] at the end of a syllable.` };
    }
    if (['บ', 'ป', 'พ', 'ฟ', 'ภ'].includes(char)) {
      return { highlightRegex: /bp|p(?!h)/i, note: `Consonne finale (Mae Kop). La lettre '${char}' se prononce [p] en fin de syllabe.`, noteEn: `Final consonant (Mae Kop). The letter '${char}' is pronounced [p] at the end of a syllable.` };
    }
    if (['ก', 'ข', 'ค', 'ฆ'].includes(char)) {
      return { highlightRegex: /k(?!h)|g/i, note: `Consonne finale (Mae Kok). La lettre '${char}' se prononce [k] en fin de syllabe.`, noteEn: `Final consonant (Mae Kok). The letter '${char}' is pronounced [k] at the end of a syllable.` };
    }
    if (char === 'ง') return { highlightRegex: /ng/i, note: `Consonne finale (Mae Kong). La lettre '${char}' se prononce [ng] en fin de syllabe.`, noteEn: `Final consonant (Mae Kong). The letter '${char}' is pronounced [ng] at the end of a syllable.` };
    if (char === 'ม') return { highlightRegex: /m/i, note: `Consonne finale (Mae Kom). La lettre '${char}' se prononce [m] en fin de syllabe.`, noteEn: `Final consonant (Mae Kom). The letter '${char}' is pronounced [m] at the end of a syllable.` };
    if (char === 'ย') return { highlightRegex: /i|y/i, note: `Consonne finale (Mae Toey). La lettre '${char}' se prononce comme un [i] en fin de syllabe.`, noteEn: `Final consonant (Mae Toey). The letter '${char}' is pronounced like an [i] at the end of a syllable.` };
    if (char === 'ว') return { highlightRegex: /o|u|w/i, note: `Consonne finale (Mae Kow). La lettre '${char}' se prononce comme un [o] ou [u] en fin de syllabe.`, noteEn: `Final consonant (Mae Kow). The letter '${char}' is pronounced like an [o] or [u] at the end of a syllable.` };
  }

  // Common Consonants and silent patterns
  if (prevChar === 'ห' && char === 'น') return { highlightRegex: /n/i, note: "Consonne 'n'. Le 'ห' précédent est muet mais agit comme un modificateur de ton (Ho Nam), changeant ainsi le ton originel de 'น'.", noteEn: "Consonant 'n'. The preceding 'ห' is silent but acts as a tone modifier (Ho Nam), thereby changing the original tone of 'น'." };
  if (prevChar === 'ห' && char === 'ม') return { highlightRegex: /m/i, note: "Consonne 'm'. Le 'ห' précédent est muet mais modifie le ton (Ho Nam).", noteEn: "Consonant 'm'. The preceding 'ห' is silent but modifies the tone (Ho Nam)." };
  if (prevChar === 'ห' && char === 'ล') return { highlightRegex: /l/i, note: "Consonne 'l'. Le 'ห' précédent est muet mais modifie le ton (Ho Nam).", noteEn: "Consonant 'l'. The preceding 'ห' is silent but modifies the tone (Ho Nam)." };
  if (prevChar === 'ห' && char === 'ง') return { highlightRegex: /ng/i, note: "Consonne 'ng'. Le 'ห' précédent est muet mais modifie le ton (Ho Nam).", noteEn: "Consonant 'ng'. The preceding 'ห' is silent but modifies the tone (Ho Nam)." };
  if (prevChar === 'ห' && char === 'ว') return { highlightRegex: /w/i, note: "Consonne 'w'. Le 'ห' précédent est muet mais modifie le ton (Ho Nam).", noteEn: "Consonant 'w'. The preceding 'ห' is silent but modifies the tone (Ho Nam)." };
  if (prevChar === 'ห' && char === 'ร') return { highlightRegex: /r/i, note: "Consonne 'r'. Le 'ห' précédent est muet mais modifie le ton (Ho Nam).", noteEn: "Consonant 'r'. The preceding 'ห' is silent but modifies the tone (Ho Nam)." };
  if (prevChar === 'ห' && char === 'ย') return { highlightRegex: /y/i, note: "Consonne 'y'. Le 'ห' précédent est muet mais modifie le ton (Ho Nam).", noteEn: "Consonant 'y'. The preceding 'ห' is silent but modifies the tone (Ho Nam)." };
  
  if (char === 'ห' && ['น','ม','ล','ง','ว','ร','ย'].includes(nextChar || '')) return { highlightRegex: /[nmlgwry]/i, note: "Consonne 'h' (Ho Nam). Ici, elle sera muette et modifiera le ton de la consonne suivante.", noteEn: "Consonant 'h' (Ho Nam). Here, it will be silent and modify the tone of the following consonant." };

  if (char === 'ก') return { highlightRegex: /g|k/i, note: "Consonne 'k/g'. Se prononce [k] (ou [g]).", noteEn: "Consonant 'k/g'. Pronounced [k] (or [g])." };
  if (char === 'ข' || char === 'ค' || char === 'ฆ') return { highlightRegex: /kh(?!r)/i, note: "Consonne 'kh'. Se prononce [kh].", noteEn: "Consonant 'kh'. Pronounced [kh]." };
  if (char === 'ง') return { highlightRegex: /ng/i, note: "Consonne 'ng'. Se prononce [ng].", noteEn: "Consonant 'ng'. Pronounced [ng]." };
  if (char === 'จ') return { highlightRegex: /j|ch/i, note: "Consonne 'j'. Se prononce [j] ou [ch] doux.", noteEn: "Consonant 'j'. Pronounced [j] or soft [ch]." };
  if (char === 'ช' || char === 'ฉ' || char === 'ฌ') return { highlightRegex: /ch/i, note: "Consonne 'ch'. Se prononce [ch].", noteEn: "Consonant 'ch'. Pronounced [ch]." };
  if (char === 'ซ' || char === 'ส' || char === 'ศ' || char === 'ษ') return { highlightRegex: /s/i, note: "Consonne 's'. Se prononce [s].", noteEn: "Consonant 's'. Pronounced [s]." };
  if (char === 'ด' || char === 'ฎ') return { highlightRegex: /d/i, note: "Consonne 'd'. Se prononce [d]. (Peut aussi être [t] en fin de mot).", noteEn: "Consonant 'd'. Pronounced [d]. (Can also be [t] at the end of a word)." };
  if (char === 'ต' || char === 'ฏ') return { highlightRegex: /t|dt/i, note: "Consonne 't'. Se prononce [t].", noteEn: "Consonant 't'. Pronounced [t]." };
  if (char === 'ท' || char === 'ถ' || char === 'ฐ' || char === 'ธ' || char === 'ฒ' || char === 'ฑ') return { highlightRegex: /th(?!r)/i, note: "Consonne 'th'. Se prononce [th].", noteEn: "Consonant 'th'. Pronounced [th]." };
  if (char === 'น' || char === 'ณ') return { highlightRegex: /n/i, note: "Consonne 'n'. Se prononce [n].", noteEn: "Consonant 'n'. Pronounced [n]." };
  if (char === 'บ') return { highlightRegex: /b/i, note: "Consonne 'b'. Se prononce [b]. (Peut être [p] en fin de mot).", noteEn: "Consonant 'b'. Pronounced [b]. (Can be [p] at the end of a word)." };
  if (char === 'ป') return { highlightRegex: /p|bp/i, note: "Consonne 'p'. Se prononce [p].", noteEn: "Consonant 'p'. Pronounced [p]." };
  if (char === 'พ' || char === 'ผ' || char === 'ภ') return { highlightRegex: /ph(?!r)|f/i, note: "Consonne 'ph'. Se prononce [ph].", noteEn: "Consonant 'ph'. Pronounced [ph]." };
  if (char === 'ฟ' || char === 'ฝ') return { highlightRegex: /f/i, note: "Consonne 'f'. Se prononce [f].", noteEn: "Consonant 'f'. Pronounced [f]." };
  if (char === 'ม') return { highlightRegex: /m/i, note: "Consonne 'm'. Se prononce [m].", noteEn: "Consonant 'm'. Pronounced [m]." };
  if (char === 'ย' || char === 'ญ') return { highlightRegex: /y/i, note: "Consonne 'y'. Se prononce [y]. (La lettre ญ peut aussi se prononcer [n] en fin).", noteEn: "Consonant 'y'. Pronounced [y]. (The letter ญ can also be pronounced [n] at the end)." };
  if (char === 'ร') return { highlightRegex: /r/i, note: "Consonne 'r'. Se prononce [r] (souvent roulé, parfois [n] en fin).", noteEn: "Consonant 'r'. Pronounced [r] (often rolled, sometimes [n] at the end)." };
  if (char === 'ล' || char === 'ฬ') return { highlightRegex: /l/i, note: "Consonne 'l'. Se prononce [l] (souvent [n] en fin).", noteEn: "Consonant 'l'. Pronounced [l] (often [n] at the end)." };
  if (char === 'ว') return { highlightRegex: /w/i, note: "Consonne 'w'. Se prononce [w].", noteEn: "Consonant 'w'. Pronounced [w]." };
  if (char === 'ห' || char === 'ฮ') return { highlightRegex: /h/i, note: "Consonne 'h'. Se prononce [h].", noteEn: "Consonant 'h'. Pronounced [h]." };
  if (char === 'อ') return { highlightRegex: /o|ɔ|a|i|u|e/i, note: "Consonne 'o' (ang). Sert souvent de support muet pour une voyelle, ou se prononce [o].", noteEn: "Consonant 'o' (ang). Often serves as a silent placeholder for a vowel, or pronounced [o]." };

  return { highlightRegex: undefined, note: `Caractère '${char}'.`, noteEn: `Character '${char}'.` };
}
