import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const dataPath = path.join(__dirname, '../app/data/course.json');
const course = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const imagesDir = path.join(__dirname, '../public/images');
const existingImages = new Set(fs.readdirSync(imagesDir).filter(f => f.endsWith('.svg')));

const colors = ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF", "#D5BAFF", "#FFBAF2", "#B8F2E6", "#E3F4BA", "#F0C987", "#FFC4E1", "#DCD3FF", "#BEEBE9"];

const makeSvg = (emoji, color) => `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="${color}" rx="40" />
  <text x="100" y="130" font-size="80" text-anchor="middle" font-family="sans-serif">${emoji}</text>
</svg>`;

function findExistingImage(id) {
  const patterns = [];
  if (id.startsWith('w_')) patterns.push(`w_w_${id.replace('w_', '')}.svg`, `${id}.svg`, `${id}_word.svg`);
  else if (id.startsWith('p_auto_')) patterns.push(`${id}.svg`, `p_p_auto_${id.replace('p_auto_', '')}.svg`, `p_p_${id.replace('p_', '')}.svg`);
  else if (id.startsWith('p_')) patterns.push(`p_p_${id.replace('p_', '')}.svg`, `p_${id}.svg`, `${id}.svg`);
  else patterns.push(`lesson-${id}.svg`, `${id}.svg`, `p_p_auto_${id}_0.svg`);

  for (let c of patterns) {
    if (existingImages.has(c)) {
      return `/images/${c}`;
    }
  }
  return null;
}

async function processMissingImages() {
  const missing = [];

  course.lessons.forEach(l => {
    if (!l.imageUrl) {
       const m = findExistingImage(l.id);
       if (m) { l.imageUrl = m; }
       else missing.push({ item: l, id: l.id, text: l.title, obj: l, type: 'lesson' });
    }

    if (l.words) {
      l.words.forEach(w => {
        if (!w.imageUrl && w.id !== 'w_dots') {
           const m = findExistingImage(w.id);
           if (m) { w.imageUrl = m; }
           else missing.push({ item: w, id: w.id, text: w.fr || w.en || '', obj: w, type: 'word' });
        }
      });
    }

    if (l.phrases) {
      l.phrases.forEach(p => {
        if (!p.imageUrl) {
           const m = findExistingImage(p.id);
           if (m) { p.imageUrl = m; }
           else missing.push({ item: p, id: p.id, text: p.fr || p.en || '', obj: p, type: 'phrase' });
        }
      });
    }
  });

  console.log(`Found ${missing.length} items actually needing a new image generation.`);
  if (missing.length === 0) {
    // Save mapping fixes
    fs.writeFileSync(dataPath, JSON.stringify(course, null, 2));
    console.log("Course updated with existing image mappings.");
    return;
  }

  // Generate missing images via Gemini
  for (let i = 0; i < missing.length; i += 40) {
    const batch = missing.slice(i, i + 40);
    const prompt = `Give me a single emoji that best represents each of these items (word, phrase, or lesson title). Return ONLY a valid JSON object mapping the ID to the single emoji. Do not include markdown or codeblocks, just the JSON string starting with { and ending with }.

Items:
${batch.map(m => `${m.id}: ${m.text}`).join('\n')}
`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      
      let text = response.text;
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}') + 1;
      if (start !== -1 && end > start) {
        text = text.slice(start, end);
        const emojis = JSON.parse(text);

        batch.forEach((m, index) => {
          const emoji = emojis[m.id] || '🤔';
          let fileName = '';
          if (m.type === 'word') fileName = `w_w_${m.id.replace(/^w_/, '')}.svg`;
          else if (m.type === 'phrase') fileName = `p_p_${m.id.replace(/^p_/, '')}.svg`;
          else fileName = `${m.id}.svg`;

          m.obj.imageUrl = `/images/${fileName}`;
          const color = colors[(i + index) % colors.length];
          
          fs.writeFileSync(path.join(imagesDir, fileName), makeSvg(emoji, color));
          existingImages.add(fileName);
        });
      }
      
      console.log(`Processed batch ${Math.floor(i/40) + 1}`);
      fs.writeFileSync(dataPath, JSON.stringify(course, null, 2));
    } catch (e) {
      console.error('Batch failed:', e);
    }
  }

  console.log('All done! JSON updated and SVGs created.');
}

processMissingImages();
