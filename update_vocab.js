const fs = require('fs');
const path = require('path');

const localesDir = 'c:\\xampp\\htdocs\\thai-learn-officiel\\src\\locales';
const files = ['fr.json', 'en.json', 'es.json', 'it.json', 'de.json'];

const translations = {
  fr: "Vocabulaire",
  en: "Vocabulary",
  es: "Vocabulario",
  it: "Vocabolario",
  de: "Vokabular"
};

files.forEach(file => {
  const filePath = path.join(localesDir, file);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const lang = file.split('.')[0];
    
    data['nav.learn'] = translations[lang];
    data['sidebar.path'] = translations[lang];
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }
});

console.log("Locales updated!");
