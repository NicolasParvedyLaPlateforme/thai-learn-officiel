import fs from 'fs';
import path from 'path';

const translations = {
  "ก": { exampleTranslationDe: "Huhn", exampleTranslationEs: "Pollo", exampleTranslationIt: "Pollo", mnemonicHintDe: "Ein Hühnerschnabel", mnemonicHintEs: "Un pico de pollo", mnemonicHintIt: "Un becco di pollo" },
  "ข": { exampleTranslationDe: "Ei", exampleTranslationEs: "Huevo", exampleTranslationIt: "Uovo", mnemonicHintDe: "Ein zerbrochenes Ei", mnemonicHintEs: "Un huevo roto", mnemonicHintIt: "Un uovo rotto" },
  "ค": { exampleTranslationDe: "Büffel", exampleTranslationEs: "Búfalo", exampleTranslationIt: "Bufalo", mnemonicHintDe: "Büffelhörner", mnemonicHintEs: "Cuernos de búfalo", mnemonicHintIt: "Corna di bufalo" },
  "ง": { exampleTranslationDe: "Schlange", exampleTranslationEs: "Serpiente", exampleTranslationIt: "Serpente", mnemonicHintDe: "Eine aufsteigende Schlange", mnemonicHintEs: "Una serpiente erguida", mnemonicHintIt: "Un serpente che si erge" },
  "จ": { exampleTranslationDe: "Teller", exampleTranslationEs: "Plato", exampleTranslationIt: "Piatto", mnemonicHintDe: "Ein drehender Teller", mnemonicHintEs: "Un plato giratorio", mnemonicHintIt: "Un piatto rotante" },
  "ฉ": { exampleTranslationDe: "Becken", exampleTranslationEs: "Platillos", exampleTranslationIt: "Piatti", mnemonicHintDe: "Zwei Becken, die aneinander schlagen", mnemonicHintEs: "Dos platillos chocando", mnemonicHintIt: "Due piatti che sbattono" },
  "ช": { exampleTranslationDe: "Elefant", exampleTranslationEs: "Elefante", exampleTranslationIt: "Elefante", mnemonicHintDe: "Ein Elefantenrüssel", mnemonicHintEs: "La trompa de un elefante", mnemonicHintIt: "La proboscide di un elefante" },
  "ซ": { exampleTranslationDe: "Kette", exampleTranslationEs: "Cadena", exampleTranslationIt: "Catena", mnemonicHintDe: "Eine zerrissene Kette", mnemonicHintEs: "Una cadena rota", mnemonicHintIt: "Una catena spezzata" },
  "ญ": { exampleTranslationDe: "Frau", exampleTranslationEs: "Mujer", exampleTranslationIt: "Donna", mnemonicHintDe: "Eine anmutige Frau", mnemonicHintEs: "Una mujer grácil", mnemonicHintIt: "Una donna graziosa" },
  "ด": { exampleTranslationDe: "Kind", exampleTranslationEs: "Niño", exampleTranslationIt: "Bambino", mnemonicHintDe: "Ein rennendes Kind", mnemonicHintEs: "Un niño corriendo", mnemonicHintIt: "Un bambino che corre" },
  "ต": { exampleTranslationDe: "Schildkröte", exampleTranslationEs: "Tortuga", exampleTranslationIt: "Tartaruga", mnemonicHintDe: "Ein Schildkrötenpanzer", mnemonicHintEs: "Un caparazón de tortuga", mnemonicHintIt: "Un guscio di tartaruga" },
  "ถ": { exampleTranslationDe: "Sack", exampleTranslationEs: "Saco", exampleTranslationIt: "Sacco", mnemonicHintDe: "Ein Sack mit offener Schlaufe", mnemonicHintEs: "Un saco con lazo abierto", mnemonicHintIt: "Un sacco con passante aperto" },
  "ท": { exampleTranslationDe: "Soldat", exampleTranslationEs: "Soldado", exampleTranslationIt: "Soldato", mnemonicHintDe: "Ein stehender Soldat", mnemonicHintEs: "Un soldado de pie", mnemonicHintIt: "Un soldato in piedi" },
  "ธ": { exampleTranslationDe: "Flagge", exampleTranslationEs: "Bandera", exampleTranslationIt: "Bandiera", mnemonicHintDe: "Eine wehende Flagge", mnemonicHintEs: "Una bandera ondeante", mnemonicHintIt: "Una bandiera sventolante" },
  "น": { exampleTranslationDe: "Maus", exampleTranslationEs: "Ratón", exampleTranslationIt: "Topo", mnemonicHintDe: "Eine kleine Maus", mnemonicHintEs: "Un pequeño ratón", mnemonicHintIt: "Un topolino" },
  "บ": { exampleTranslationDe: "Blatt", exampleTranslationEs: "Hoja", exampleTranslationIt: "Foglia", mnemonicHintDe: "Ein breites Blatt", mnemonicHintEs: "Una hoja ancha", mnemonicHintIt: "Una foglia larga" },
  "ป": { exampleTranslationDe: "Fisch", exampleTranslationEs: "Pez", exampleTranslationIt: "Pesce", mnemonicHintDe: "Ein Fischschwanz", mnemonicHintEs: "La cola de un pez", mnemonicHintIt: "La coda di un pesce" },
  "ผ": { exampleTranslationDe: "Biene", exampleTranslationEs: "Abeja", exampleTranslationIt: "Ape", mnemonicHintDe: "Der W-förmige Flug einer Biene", mnemonicHintEs: "El vuelo en W de una abeja", mnemonicHintIt: "Il volo a W di un'ape" },
  "ฝ": { exampleTranslationDe: "Deckel", exampleTranslationEs: "Tapa", exampleTranslationIt: "Coperchio", mnemonicHintDe: "Ein Deckel mit Griff", mnemonicHintEs: "Una tapa con asa", mnemonicHintIt: "Un coperchio con manico" },
  "พ": { exampleTranslationDe: "Tablett", exampleTranslationEs: "Bandeja", exampleTranslationIt: "Vassoio", mnemonicHintDe: "Eine Trophäe (ähnelt einem Tablett)", mnemonicHintEs: "Un trofeo (parecido a la bandeja)", mnemonicHintIt: "Un trofeo (simile a un vassoio)" },
  "ฟ": { exampleTranslationDe: "Zahn", exampleTranslationEs: "Diente", exampleTranslationIt: "Dente", mnemonicHintDe: "Ein langer, spitzer Zahn", mnemonicHintEs: "Un diente largo y afilado", mnemonicHintIt: "Un dente lungo e affilato" },
  "ภ": { exampleTranslationDe: "Dschunke", exampleTranslationEs: "Junco", exampleTranslationIt: "Giunca", mnemonicHintDe: "Das Segel einer Dschunke", mnemonicHintEs: "La vela de un barco junco", mnemonicHintIt: "La vela di una giunca" },
  "ม": { exampleTranslationDe: "Pferd", exampleTranslationEs: "Caballo", exampleTranslationIt: "Cavallo", mnemonicHintDe: "Ein sich dehnendes Pferd", mnemonicHintEs: "Un caballo estirándose", mnemonicHintIt: "Un cavallo che si allunga" },
  "ย": { exampleTranslationDe: "Riese", exampleTranslationEs: "Gigante", exampleTranslationIt: "Gigante", mnemonicHintDe: "Ein verdrehter Riese", mnemonicHintEs: "Un gigante retorcido", mnemonicHintIt: "Un gigante contorto" },
  "ร": { exampleTranslationDe: "Boot", exampleTranslationEs: "Barco", exampleTranslationIt: "Barca", mnemonicHintDe: "Die Vorderseite eines Bootes", mnemonicHintEs: "La parte delantera de un barco", mnemonicHintIt: "La parte anteriore di una barca" },
  "ล": { exampleTranslationDe: "Affe", exampleTranslationEs: "Mono", exampleTranslationIt: "Scimmia", mnemonicHintDe: "Ein hängender Affe", mnemonicHintEs: "Un mono colgando", mnemonicHintIt: "Una scimmia appesa" },
  "ว": { exampleTranslationDe: "Ring", exampleTranslationEs: "Anillo", exampleTranslationIt: "Anello", mnemonicHintDe: "Ein runder Ring", mnemonicHintEs: "Un anillo redondo", mnemonicHintIt: "Un anello rotondo" },
  "ศ": { exampleTranslationDe: "Pavillon", exampleTranslationEs: "Pabellón", exampleTranslationIt: "Padiglione", mnemonicHintDe: "Ein hoher Pavillon", mnemonicHintEs: "Un pabellón alto", mnemonicHintIt: "Un alto padiglione" },
  "ษ": { exampleTranslationDe: "Einsiedler", exampleTranslationEs: "Ermitaño", exampleTranslationIt: "Eremita", mnemonicHintDe: "Der Stock eines Einsiedlers", mnemonicHintEs: "El bastón de un ermitaño", mnemonicHintIt: "Il bastone di un eremita" },
  "ส": { exampleTranslationDe: "Tiger", exampleTranslationEs: "Tigre", exampleTranslationIt: "Tigre", mnemonicHintDe: "Der Schwanz eines Tigers", mnemonicHintEs: "La cola de un tigre", mnemonicHintIt: "La coda di una tigre" },
  "ห": { exampleTranslationDe: "Truhe", exampleTranslationEs: "Cofre", exampleTranslationIt: "Forziere", mnemonicHintDe: "Eine offene Truhe", mnemonicHintEs: "Un cofre abierto", mnemonicHintIt: "Un forziere aperto" },
  "ฬ": { exampleTranslationDe: "Drachen", exampleTranslationEs: "Cometa", exampleTranslationIt: "Aquilone", mnemonicHintDe: "Ein Drachen mit langem Schwanz", mnemonicHintEs: "Una cometa con una larga cola", mnemonicHintIt: "Un aquilone con coda lunga" },
  "อ": { exampleTranslationDe: "Becken", exampleTranslationEs: "Palangana", exampleTranslationIt: "Bacinella", mnemonicHintDe: "Ein rundes Becken", mnemonicHintEs: "Una palangana redonda", mnemonicHintIt: "Una bacinella rotonda" },
  "ฮ": { exampleTranslationDe: "Eule", exampleTranslationEs: "Búho", exampleTranslationIt: "Gufo", mnemonicHintDe: "Eine sitzende Eule", mnemonicHintEs: "Un búho posado", mnemonicHintIt: "Un gufo appollaiato" },
  "ฆ": { exampleTranslationDe: "Glocke", exampleTranslationEs: "Campana", exampleTranslationIt: "Campana", mnemonicHintDe: "Eine Tempelglocke", mnemonicHintEs: "Una campana de templo", mnemonicHintIt: "Una campana del tempio" },
  "ฌ": { exampleTranslationDe: "Baum", exampleTranslationEs: "Árbol", exampleTranslationIt: "Albero", mnemonicHintDe: "Ein buschiger Baum", mnemonicHintEs: "Un árbol frondoso", mnemonicHintIt: "Un albero cespuglioso" },
  "ฎ": { exampleTranslationDe: "Kopfschmuck", exampleTranslationEs: "Tocado", exampleTranslationIt: "Copricapo", mnemonicHintDe: "Der Kopfschmuck einer Tänzerin", mnemonicHintEs: "El tocado de una bailarina", mnemonicHintIt: "Il copricapo di una ballerina" },
  "ฏ": { exampleTranslationDe: "Speer", exampleTranslationEs: "Jabalina", exampleTranslationIt: "Giavellotto", mnemonicHintDe: "Eine Speerspitze", mnemonicHintEs: "Una punta de jabalina", mnemonicHintIt: "Una punta di giavellotto" },
  "ฐ": { exampleTranslationDe: "Sockel", exampleTranslationEs: "Pedestal", exampleTranslationIt: "Piedistallo", mnemonicHintDe: "Ein verzierter Sockel", mnemonicHintEs: "Un pedestal esculpido", mnemonicHintIt: "Un piedistallo scolpito" },
  "ฑ": { exampleTranslationDe: "Montho", exampleTranslationEs: "Reina Montho", exampleTranslationIt: "Regina Montho", mnemonicHintDe: "Eine mythologische Königin", mnemonicHintEs: "Una reina mitológica", mnemonicHintIt: "Una regina mitologica" },
  "ฒ": { exampleTranslationDe: "Alter Mann", exampleTranslationEs: "Anciano", exampleTranslationIt: "Vecchio", mnemonicHintDe: "Ein gebeugter alter Mann", mnemonicHintEs: "Un anciano encorvado", mnemonicHintIt: "Un vecchio curvo" },
  "ณ": { exampleTranslationDe: "Novize", exampleTranslationEs: "Novicio", exampleTranslationIt: "Novizio", mnemonicHintDe: "Ein junger Mönch", mnemonicHintEs: "Un joven monje", mnemonicHintIt: "Un giovane monaco" },
  "ฤ": { exampleTranslationDe: "Vokal rue/ri", exampleTranslationEs: "Vocal rue/ri", exampleTranslationIt: "Vocale rue/ri", mnemonicHintDe: "Eine Schleife mit Schwanz", mnemonicHintEs: "Un bucle con cola", mnemonicHintIt: "Un anello con coda" },
  "ั": { exampleTranslationDe: "Vokal a (kurz)", exampleTranslationEs: "Vocal a (corta)", exampleTranslationIt: "Vocale a (corta)", mnemonicHintDe: "Ein fliegender kleiner Vogel", mnemonicHintEs: "Un pajarito volando", mnemonicHintIt: "Un uccellino che vola" },
  "ำ": { exampleTranslationDe: "Vokal am", exampleTranslationEs: "Vocal am", exampleTranslationIt: "Vocale am", mnemonicHintDe: "Ein kleiner Kreis", mnemonicHintEs: "Un círculo pequeño", mnemonicHintIt: "Un piccolo cerchio" },
  "่": { exampleTranslationDe: "Tiefer Ton", exampleTranslationEs: "Tono bajo", exampleTranslationIt: "Tono basso", mnemonicHintDe: "Ein senkrechter Strich", mnemonicHintEs: "Un trazo vertical", mnemonicHintIt: "Un tratto verticale" },
  "้": { exampleTranslationDe: "Fallender Ton", exampleTranslationEs: "Tono descendente", exampleTranslationIt: "Tono discendente", mnemonicHintDe: "Ein kleiner Haken", mnemonicHintEs: "Un pequeño gancho", mnemonicHintIt: "Un piccolo gancio" },
  "๊": { exampleTranslationDe: "Hoher Ton", exampleTranslationEs: "Tono alto", exampleTranslationIt: "Tono alto", mnemonicHintDe: "Eine winzige Zahl 7", mnemonicHintEs: "Un número 7 diminuto", mnemonicHintIt: "Un piccolo numero 7" },
  "๋": { exampleTranslationDe: "Steigender Ton", exampleTranslationEs: "Tono ascendente", exampleTranslationIt: "Tono ascendente", mnemonicHintDe: "Ein winziges Pluszeichen", mnemonicHintEs: "Un diminuto signo más", mnemonicHintIt: "Un minuscolo segno più" },
  "็": { exampleTranslationDe: "Vokalverkürzer", exampleTranslationEs: "Acortador de vocal", exampleTranslationIt: "Accorciatore di vocale", mnemonicHintDe: "Eine winzige Zahl 8", mnemonicHintEs: "Un número 8 diminuto", mnemonicHintIt: "Un piccolo numero 8" },
  "์": { exampleTranslationDe: "Stumm-Zeichen", exampleTranslationEs: "Marca de silencio", exampleTranslationIt: "Segno di silenzio", mnemonicHintDe: "Eine stumme Note", mnemonicHintEs: "Una nota silenciosa", mnemonicHintIt: "Una nota silenziosa" },
  "ะ": { exampleTranslationDe: "Vokal a (kurz)", exampleTranslationEs: "Vocal a (corta)", exampleTranslationIt: "Vocale a (corta)", mnemonicHintDe: "Zwei kleine Blasen (danach)", mnemonicHintEs: "Dos pequeñas burbujas (después)", mnemonicHintIt: "Due piccole bolle (dopo)" },
  "า": { exampleTranslationDe: "Vokal a (lang)", exampleTranslationEs: "Vocal a (larga)", exampleTranslationIt: "Vocale a (lunga)", mnemonicHintDe: "Ein Gehstock (danach)", mnemonicHintEs: "Un bastón (después)", mnemonicHintIt: "Un bastone da passeggio (dopo)" },
  "ิ": { exampleTranslationDe: "Vokal i (kurz)", exampleTranslationEs: "Vocal i (corta)", exampleTranslationIt: "Vocale i (corta)", mnemonicHintDe: "Ein einfacher Hut (darüber)", mnemonicHintEs: "Un sombrero sencillo (arriba)", mnemonicHintIt: "Un cappello semplice (sopra)" },
  "ี": { exampleTranslationDe: "Vokal i (lang)", exampleTranslationEs: "Vocal i (larga)", exampleTranslationIt: "Vocale i (lunga)", mnemonicHintDe: "Ein Hut mit Feder (darüber)", mnemonicHintEs: "Un sombrero con pluma (arriba)", mnemonicHintIt: "Un cappello con piuma (sopra)" },
  "ึ": { exampleTranslationDe: "Vokal ue (kurz)", exampleTranslationEs: "Vocal ue (corta)", exampleTranslationIt: "Vocale ue (corta)", mnemonicHintDe: "Ein Hut mit Ring (darüber)", mnemonicHintEs: "Un sombrero con aro (arriba)", mnemonicHintIt: "Un cappello con anello (sopra)" },
  "ื": { exampleTranslationDe: "Vokal ue (lang)", exampleTranslationEs: "Vocal ue (larga)", exampleTranslationIt: "Vocale ue (lunga)", mnemonicHintDe: "Ein Doppelfederhut (darüber)", mnemonicHintEs: "Un sombrero de doble pluma (arriba)", mnemonicHintIt: "Un cappello a doppia piuma (sopra)" },
  "ุ": { exampleTranslationDe: "Vokal u (kurz)", exampleTranslationEs: "Vocal u (corta)", exampleTranslationIt: "Vocale u (corta)", mnemonicHintDe: "Ein Wassertropfen (darunter)", mnemonicHintEs: "Una gota de agua (debajo)", mnemonicHintIt: "Una goccia d'acqua (sotto)" },
  "ู": { exampleTranslationDe: "Vokal u (lang)", exampleTranslationEs: "Vocal u (larga)", exampleTranslationIt: "Vocale u (lunga)", mnemonicHintDe: "Ein kleiner Schuh (darunter)", mnemonicHintEs: "Un zapato pequeño (debajo)", mnemonicHintIt: "Una piccola scarpa (sotto)" },
  "เ": { exampleTranslationDe: "Vokal e", exampleTranslationEs: "Vocal e", exampleTranslationIt: "Vocale e", mnemonicHintDe: "Ein großer Pfosten (davor)", mnemonicHintEs: "Un poste alto (delante)", mnemonicHintIt: "Un palo alto (davanti)" },
  "แ": { exampleTranslationDe: "Vokal ae", exampleTranslationEs: "Vocal ae", exampleTranslationIt: "Vocale ae", mnemonicHintDe: "Zwei große Pfosten (davor)", mnemonicHintEs: "Dos postes altos (delante)", mnemonicHintIt: "Due pali alti (davanti)" },
  "โ": { exampleTranslationDe: "Vokal o", exampleTranslationEs: "Vocal o", exampleTranslationIt: "Vocale o", mnemonicHintDe: "Ein Bumerang (davor)", mnemonicHintEs: "Un bumerán (delante)", mnemonicHintIt: "Un boomerang (davanti)" },
  "ไ": { exampleTranslationDe: "Vokal ai (maimai)", exampleTranslationEs: "Vocal ai (maimai)", exampleTranslationIt: "Vocale ai (maimai)", mnemonicHintDe: "Eine erhobene Hand (davor)", mnemonicHintEs: "Una mano alzada (delante)", mnemonicHintIt: "Una mano alzata (davanti)" },
  "ใ": { exampleTranslationDe: "Vokal ai (maimuan)", exampleTranslationEs: "Vocal ai (maimuan)", exampleTranslationIt: "Vocale ai (maimuan)", mnemonicHintDe: "Ein gerolltes Blatt (davor)", mnemonicHintEs: "Una hoja enrollada (delante)", mnemonicHintIt: "Una foglia arrotolata (davanti)" }
};

const filePath = path.join(process.cwd(), 'app', 'lib', 'alphabet-data.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Also update the interface AlphabetItem to have the new optional properties
content = content.replace(/mnemonicHintEn\?: string;/, 'mnemonicHintEn?: string;\n  mnemonicHintDe?: string;\n  mnemonicHintEs?: string;\n  mnemonicHintIt?: string;\n  exampleTranslationDe?: string;\n  exampleTranslationEs?: string;\n  exampleTranslationIt?: string;');

const lines = content.split('\n');
const newLines = lines.map(line => {
  if (line.includes('{ letter: "')) {
    const letterMatch = line.match(/letter: "(.)"/);
    if (letterMatch && translations[letterMatch[1]]) {
      const t = translations[letterMatch[1]];
      let insertion = '';
      for (const [key, val] of Object.entries(t)) {
        insertion += `, ${key}: "${val}"`;
      }
      return line.replace(/mnemonicEmoji: "(.*?)"( *)}/, `mnemonicEmoji: "$1"${insertion} }`);
    }
  }
  return line;
});

fs.writeFileSync(filePath, newLines.join('\n'));
console.log('Successfully updated alphabet-data.ts with translations.');
