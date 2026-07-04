const fs = require('fs');

const translations = {
  fr: {
    "composition.tone_mark_explanation": "Modificateur : Ce symbole ne se prononce pas seul mais altère le ton ou le son de la consonne.",
    "composition.tone_rule_prefix": "Règle de ton :",
    "composition.tone_class.mid": "Classe Moyenne",
    "composition.tone_class.high": "Classe Haute",
    "composition.tone_class.low": "Classe Basse",
    "composition.tone_result.low": "Ton Bas",
    "composition.tone_result.falling": "Ton Descendant",
    "composition.tone_result.high": "Ton Haut",
    "composition.tone_result.rising": "Ton Ascendant",
    "composition.tone_result.mid": "Ton Moyen",
    "composition.syllable_type.live": "Syllabe Vivante",
    "composition.syllable_type.dead": "Syllabe Morte",
    "composition.vowel_length.short": "Voyelle Courte",
    "composition.vowel_length.long": "Voyelle Longue",
    "composition.final_consonant": "Consonne Finale",
    "composition.mata.Mae Ko Ka": "Mae Ko Ka (Aucune consonne finale)",
    "composition.mata.Mae Kok": "Mae Kok (Son 'K')",
    "composition.mata.Mae Kot": "Mae Kot (Son 'T')",
    "composition.mata.Mae Kop": "Mae Kop (Son 'P')",
    "composition.mata.Mae Kong": "Mae Kong (Son 'NG')",
    "composition.mata.Mae Kan": "Mae Kan (Son 'N')",
    "composition.mata.Mae Kom": "Mae Kom (Son 'M')",
    "composition.mata.Mae Koei": "Mae Koei (Son 'Y')",
    "composition.mata.Mae Kow": "Mae Kow (Son 'W')",
    "composition.mata_explanation": "Cette consonne appartient à la famille {mata} et se prononce donc comme un '{sound}' bloqué à la fin de la syllabe.",
    "composition.implicit_o_vowel": "Voyelle implicite : Lorsqu'il n'y a pas de voyelle écrite entre deux consonnes, on prononce un \"O\" court (โ-ะ) invisible."
  },
  en: {
    "composition.syllable_type.live": "Live Syllable",
    "composition.syllable_type.dead": "Dead Syllable",
    "composition.vowel_length.short": "Short Vowel",
    "composition.vowel_length.long": "Long Vowel",
    "composition.final_consonant": "Final Consonant",
    "composition.mata.Mae Ko Ka": "Mae Ko Ka (No final consonant)",
    "composition.mata.Mae Kok": "Mae Kok ('K' sound)",
    "composition.mata.Mae Kot": "Mae Kot ('T' sound)",
    "composition.mata.Mae Kop": "Mae Kop ('P' sound)",
    "composition.mata.Mae Kong": "Mae Kong ('NG' sound)",
    "composition.mata.Mae Kan": "Mae Kan ('N' sound)",
    "composition.mata.Mae Kom": "Mae Kom ('M' sound)",
    "composition.mata.Mae Koei": "Mae Koei ('Y' sound)",
    "composition.mata.Mae Kow": "Mae Kow ('W' sound)",
    "composition.mata_explanation": "This consonant belongs to the {mata} family and is pronounced as a stopped '{sound}' at the end of the syllable.",
    "composition.implicit_o_vowel": "Implicit Vowel: When there is no written vowel between two consonants, a short, invisible 'O' (โ-ะ) is pronounced."
  },
  es: {
    "composition.syllable_type.live": "Sílaba Viva",
    "composition.syllable_type.dead": "Sílaba Muerta",
    "composition.vowel_length.short": "Vocal Corta",
    "composition.vowel_length.long": "Vocal Larga",
    "composition.final_consonant": "Consonante Final",
    "composition.mata.Mae Ko Ka": "Mae Ko Ka (Sin consonante final)",
    "composition.mata.Mae Kok": "Mae Kok (Sonido 'K')",
    "composition.mata.Mae Kot": "Mae Kot (Sonido 'T')",
    "composition.mata.Mae Kop": "Mae Kop (Sonido 'P')",
    "composition.mata.Mae Kong": "Mae Kong (Sonido 'NG')",
    "composition.mata.Mae Kan": "Mae Kan (Sonido 'N')",
    "composition.mata.Mae Kom": "Mae Kom (Sonido 'M')",
    "composition.mata.Mae Koei": "Mae Koei (Sonido 'Y')",
    "composition.mata.Mae Kow": "Mae Kow (Sonido 'W')",
    "composition.mata_explanation": "Esta consonante pertenece a la familia {mata} y, por lo tanto, se pronuncia como una '{sound}' al final de la sílaba.",
    "composition.implicit_o_vowel": "Vocal implícita: Cuando no hay una vocal escrita entre dos consonantes, se pronuncia una 'O' corta (โ-ะ) invisible."
  },
  de: {
    "composition.syllable_type.live": "Lebendige Silbe",
    "composition.syllable_type.dead": "Tote Silbe",
    "composition.vowel_length.short": "Kurzer Vokal",
    "composition.vowel_length.long": "Langer Vokal",
    "composition.final_consonant": "Schlusskonsonant",
    "composition.mata.Mae Ko Ka": "Mae Ko Ka (Kein Schlusskonsonant)",
    "composition.mata.Mae Kok": "Mae Kok ('K' Laut)",
    "composition.mata.Mae Kot": "Mae Kot ('T' Laut)",
    "composition.mata.Mae Kop": "Mae Kop ('P' Laut)",
    "composition.mata.Mae Kong": "Mae Kong ('NG' Laut)",
    "composition.mata.Mae Kan": "Mae Kan ('N' Laut)",
    "composition.mata.Mae Kom": "Mae Kom ('M' Laut)",
    "composition.mata.Mae Koei": "Mae Koei ('Y' Laut)",
    "composition.mata.Mae Kow": "Mae Kow ('W' Laut)",
    "composition.mata_explanation": "Dieser Konsonant gehört zur {mata}-Familie und wird am Silbenende wie ein gestopptes '{sound}' ausgesprochen.",
    "composition.implicit_o_vowel": "Impliziter Vokal: Wenn kein Vokal zwischen zwei Konsonanten geschrieben steht, wird ein kurzes, unsichtbares 'O' (โ-ะ) gesprochen."
  },
  it: {
    "composition.syllable_type.live": "Sillaba Viva",
    "composition.syllable_type.dead": "Sillaba Morta",
    "composition.vowel_length.short": "Vocale Corta",
    "composition.vowel_length.long": "Vocale Lunga",
    "composition.final_consonant": "Consonante Finale",
    "composition.mata.Mae Ko Ka": "Mae Ko Ka (Nessuna consonante finale)",
    "composition.mata.Mae Kok": "Mae Kok (Suono 'K')",
    "composition.mata.Mae Kot": "Mae Kot (Suono 'T')",
    "composition.mata.Mae Kop": "Mae Kop (Suono 'P')",
    "composition.mata.Mae Kong": "Mae Kong (Suono 'NG')",
    "composition.mata.Mae Kan": "Mae Kan (Suono 'N')",
    "composition.mata.Mae Kom": "Mae Kom (Suono 'M')",
    "composition.mata.Mae Koei": "Mae Koei (Suono 'Y')",
    "composition.mata.Mae Kow": "Mae Kow (Suono 'W')",
    "composition.mata_explanation": "Questa consonante appartiene alla famiglia {mata} e quindi si pronuncia come una '{sound}' alla fine della sillaba.",
    "composition.implicit_o_vowel": "Vocale implicita: Quando non c'è una vocale scritta tra due consonanti, si pronuncia una 'O' corta (โ-ะ) invisibile."
  }
};

const locales = ['fr', 'en', 'es', 'de', 'it'];
for (const locale of locales) {
  const path = `./src/locales/${locale}.json`;
  let data = {};
  try {
    data = JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch(e) {
    console.error(`Could not read ${path}`);
    continue;
  }
  
  Object.assign(data, translations[locale]);
  
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
  console.log(`Updated ${path}`);
}
