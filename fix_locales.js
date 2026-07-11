const fs = require('fs');
const files = ['fr', 'en', 'es', 'de', 'it'];
files.forEach(lang => {
  const path = `src/locales/${lang}.json`;
  let data = JSON.parse(fs.readFileSync(path, 'utf8'));
  data['auto.complete_all_parts_level'] = lang === 'fr' ? 'Terminez toutes les parties du Niveau ' : 
                                          lang === 'en' ? 'Complete all parts of Level ' :
                                          lang === 'es' ? 'Completa todas las partes del Nivel ' :
                                          lang === 'de' ? 'Beende alle Teile von Level ' :
                                          'Completa tutte le parti del Livello ';
  data['auto.complete_level'] = lang === 'fr' ? 'Terminez le Niveau ' :
                                lang === 'en' ? 'Complete Level ' :
                                lang === 'es' ? 'Completa el Nivel ' :
                                lang === 'de' ? 'Beende Level ' :
                                'Completa il Livello ';
  data['auto.full_to_unlock'] = lang === 'fr' ? ' (entier) pour débloquer.' :
                                lang === 'en' ? ' (full) to unlock.' :
                                lang === 'es' ? ' (entero) para desbloquear.' :
                                lang === 'de' ? ' (ganz) zum Entsperren.' :
                                ' (intero) per sbloccare.';
  data['auto.complete_part_1_of_level'] = lang === 'fr' ? 'Terminez la partie 1 du Niveau ' :
                                          lang === 'en' ? 'Complete part 1 of Level ' :
                                          lang === 'es' ? 'Completa la parte 1 del Nivel ' :
                                          lang === 'de' ? 'Beende Teil 1 von Level ' :
                                          'Completa la parte 1 del Livello ';
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
});
