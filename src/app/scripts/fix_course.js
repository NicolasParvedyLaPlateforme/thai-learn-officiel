const fs = require('fs');

const course = JSON.parse(fs.readFileSync('./app/data/course.json', 'utf8'));

// 1. Fix ID conflicts
const renames = [
    { lesson: 'lesson-8', oldId: 'w_khai', newId: 'w_khai_sell' },
    { lesson: 'lesson-20', oldId: 'w_kai', newId: 'w_kai_2' },
    { lesson: 'lesson-23', oldId: 'w_hiw', newId: 'w_hiw_2' },
    { lesson: 'lesson-28', oldId: 'w_khai', newId: 'w_khai_sell_2' },
    { lesson: 'lesson-32', oldId: 'w_ron', newId: 'w_ron_2' },
    { lesson: 'lesson-32', oldId: 'w_naow', newId: 'w_naow_2' },
    { lesson: 'lesson-43', oldId: 'w_thuk', newId: 'w_thuk_correct' },
    { lesson: 'lesson-43', oldId: 'w_phaeng', newId: 'w_phaeng_2' },
    { lesson: 'lesson-43', oldId: 'w_sai', newId: 'w_sai_put' },
    { lesson: 'lesson-45', oldId: 'w_dek', newId: 'w_dek_2' },
    { lesson: 'lesson-45', oldId: 'w_phuean', newId: 'w_phuean_2' },
    { lesson: 'lesson-51', oldId: 'w_khai', newId: 'w_khai_fever' },
    { lesson: 'lesson-51', oldId: 'w_nueay', newId: 'w_nueay_2' },
    { lesson: 'lesson-52', oldId: 'w_krot', newId: 'w_krot_2' },
    { lesson: 'lesson-53', oldId: 'w_khit', newId: 'w_khit_2' },
    { lesson: 'lesson-60', oldId: 'w_phut', newId: 'w_phut_wed' },
    { lesson: 'lesson-62', oldId: 'w_rong_raem', newId: 'w_rong_raem_2' },
    { lesson: 'lesson-62', oldId: 'w_talat', newId: 'w_talat_2' },
    { lesson: 'lesson-62', oldId: 'w_khao', newId: 'w_khao_enter' },
    { lesson: 'lesson-63', oldId: 'w_khrang', newId: 'w_khrang_2' }
];

renames.forEach(({ lesson, oldId, newId }) => {
    const l = course.lessons.find((x) => x.id === lesson);
    if (l) {
        if (l.words) {
            const word = l.words.find(w => w.id === oldId);
            if (word) {
                word.id = newId;
            }
        }
        if (l.phrases) {
            l.phrases.forEach(p => {
                if (p.components) {
                    p.components = p.components.map(id => id === oldId ? newId : id);
                }
            });
        }
    }
});

// 2. Fix extension lesson phrases pointing ONLY to index 0.
const extLessons = course.lessons.filter(l => l.id.match(/-a\d$/));
extLessons.forEach(l => {
    if (l.words && l.phrases) {
        l.phrases.forEach(p => {
            if (p.components) {
                let fixComponents = p.components.map(c => {
                   if (c.startsWith('w_lesson-')) {
                      let w = l.words.find(w => w.id === c);
                      if (!w || !p.th.includes(w.th)) {
                          // Find correct
                          let correct = l.words.find(w => p.th.includes(w.th));
                          return correct ? correct.id : c;
                      }
                      return c;
                   }
                   return c;
                });
                p.components = fixComponents;
            }
        });
    }
});

// 3. Address missing dependencies (w_suay used in lesson-36 and 40 but defined in 42).
const l42 = course.lessons.find(l => l.id === 'lesson-42');
let w_suay;
if (l42 && l42.words) {
    w_suay = l42.words.find(w => w.id === 'w_suay');
}
if (w_suay) {
    const l36 = course.lessons.find(l => l.id === 'lesson-36');
    if (l36) {
        if (!l36.words.find(w => w.id === 'w_suay')) {
            l36.words.push(w_suay);
        }
        l42.words = l42.words.filter(w => w.id !== 'w_suay');
    }
}

fs.writeFileSync('./app/data/course.json', JSON.stringify(course, null, 2));
console.log('Fixed course.json');
