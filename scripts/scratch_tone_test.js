const consonants = {
    high: ['ข', 'ฃ', 'ฉ', 'ฐ', 'ถ', 'ผ', 'ฝ', 'ศ', 'ษ', 'ส', 'ห'],
    mid: ['ก', 'จ', 'ฎ', 'ฏ', 'ด', 'ต', 'บ', 'ป', 'อ'],
    low: ['ค', 'ฅ', 'ฆ', 'ง', 'ช', 'ซ', 'ฌ', 'ญ', 'ฑ', 'ฒ', 'ณ', 'ท', 'ธ', 'น', 'พ', 'ฟ', 'ภ', 'ม', 'ย', 'ร', 'ล', 'ว', 'ฬ', 'ฮ']
};

const liveEndings = ['ง', 'น', 'ม', 'ย', 'ว', 'ณ', 'ญ', 'ร', 'ล', 'ฬ'];
const deadEndings = ['ก', 'ด', 'บ', 'ข', 'ค', 'ฆ', 'จ', 'ช', 'ซ', 'ฎ', 'ฏ', 'ฐ', 'ฑ', 'ฒ', 'ต', 'ถ', 'ท', 'ธ', 'ศ', 'ษ', 'ส', 'ป', 'พ', 'ฟ', 'ภ'];

const toneMarks = {
    '่': 'mai ek',
    '้': 'mai tho',
    '๊': 'mai tri',
    '๋': 'mai chattawa'
};

const longVowels = ['า', 'ี', 'ื', 'ู', 'เ', 'แ', 'โ', 'ใ', 'ไ', 'อ', 'ว', 'ย'];
const shortVowels = ['ะ', 'ั', 'ิ', 'ึ', 'ุ', '็'];

function analyzeSyllable(syllable) {
    // Basic regex for Thai syllable:
    // (Leading Vowel)? (Initial Consonant) (Cluster Consonant)? (Top/Bottom Vowel)? (Tone Mark)? (Top/Bottom Vowel)? (Final Consonant)?
    const regex = /^([เแโใไ])?([ก-ฮ])([ก-ฮ])?([ะ-ู็])?([่-๋])?([ะ-ู็])?([าอยว])?([ก-ฮ])?$/;
    const match = syllable.match(regex);
    if (!match) return { error: "Unrecognized syllable pattern", syllable };

    const [ _, leadVowel, initCons, cluster, vowel1, toneMark, vowel2, trailingVowel, finalCons ] = match;
    
    let initialClass = 'low';
    if (consonants.high.includes(initCons)) initialClass = 'high';
    else if (consonants.mid.includes(initCons)) initialClass = 'mid';

    // Figure out ending
    let isDead = false;
    let actualFinal = finalCons;
    if (actualFinal) {
        if (deadEndings.includes(actualFinal)) isDead = true;
    } else {
        // No final consonant, check vowel length
        // Simplify: just check if there's a short vowel mark
        if (shortVowels.includes(vowel1) || shortVowels.includes(vowel2) || shortVowels.includes(leadVowel)) {
            isDead = true;
        }
    }

    return {
        syllable,
        initCons,
        initialClass,
        toneMark: toneMark ? toneMarks[toneMark] : 'none',
        isDead
    };
}

console.log(analyzeSyllable('บ้าน')); // บ้าน : บ (mid) า (long) น (live) ้ (mai tho) => falling
console.log(analyzeSyllable('มาก')); // มาก : ม (low) า (long) ก (dead) => falling
console.log(analyzeSyllable('ดี')); // ดี : ด (mid) ี (long) => mid
