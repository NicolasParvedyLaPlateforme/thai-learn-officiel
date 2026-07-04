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
    "composition.tone_result.mid": "Ton Moyen"
  },
  en: {
    "composition.tone_mark_explanation": "Modifier: This symbol is not pronounced alone but alters the tone or sound of the consonant.",
    "composition.tone_rule_prefix": "Tone rule:",
    "composition.tone_class.mid": "Mid Class",
    "composition.tone_class.high": "High Class",
    "composition.tone_class.low": "Low Class",
    "composition.tone_result.low": "Low Tone",
    "composition.tone_result.falling": "Falling Tone",
    "composition.tone_result.high": "High Tone",
    "composition.tone_result.rising": "Rising Tone",
    "composition.tone_result.mid": "Mid Tone"
  },
  es: {
    "composition.tone_mark_explanation": "Modificador: Este símbolo no se pronuncia solo, pero altera el tono o el sonido de la consonante.",
    "composition.tone_rule_prefix": "Regla de tono:",
    "composition.tone_class.mid": "Clase Media",
    "composition.tone_class.high": "Clase Alta",
    "composition.tone_class.low": "Clase Baja",
    "composition.tone_result.low": "Tono Bajo",
    "composition.tone_result.falling": "Tono Descendente",
    "composition.tone_result.high": "Tono Alto",
    "composition.tone_result.rising": "Tono Ascendente",
    "composition.tone_result.mid": "Tono Medio"
  },
  de: {
    "composition.tone_mark_explanation": "Modifikator: Dieses Symbol wird nicht allein ausgesprochen, sondern ändert den Ton oder Klang des Konsonanten.",
    "composition.tone_rule_prefix": "Tonregel:",
    "composition.tone_class.mid": "Mittelklasse",
    "composition.tone_class.high": "Hohe Klasse",
    "composition.tone_class.low": "Niedrige Klasse",
    "composition.tone_result.low": "Tiefer Ton",
    "composition.tone_result.falling": "Fallender Ton",
    "composition.tone_result.high": "Hoher Ton",
    "composition.tone_result.rising": "Steigender Ton",
    "composition.tone_result.mid": "Mittlerer Ton"
  },
  it: {
    "composition.tone_mark_explanation": "Modificatore: Questo simbolo non si pronuncia da solo ma altera il tono o il suono della consonante.",
    "composition.tone_rule_prefix": "Regola del tono:",
    "composition.tone_class.mid": "Classe Media",
    "composition.tone_class.high": "Classe Alta",
    "composition.tone_class.low": "Classe Bassa",
    "composition.tone_result.low": "Tono Basso",
    "composition.tone_result.falling": "Tono Discendente",
    "composition.tone_result.high": "Tono Alto",
    "composition.tone_result.rising": "Tono Ascendente",
    "composition.tone_result.mid": "Tono Medio"
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
