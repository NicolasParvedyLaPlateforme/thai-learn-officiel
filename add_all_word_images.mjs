import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const data = JSON.parse(fs.readFileSync('./app/data/course.json', 'utf8'));

const colors = ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF", "#D5BAFF", "#FFBAF2", "#B8F2E6", "#E3F4BA", "#F0C987", "#FFC4E1", "#DCD3FF", "#BEEBE9"];
const makeSvg = (emoji, color) => `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="${color}" rx="40" />
  <text x="100" y="130" font-size="80" text-anchor="middle" font-family="sans-serif">${emoji}</text>
</svg>`;

async function processWords() {
  const wordsToProcess = [];
  data.lessons.forEach(l => {
    l.words.forEach(w => {
      if (!w.imageUrl && w.id !== 'w_dots') {
        wordsToProcess.push(w);
      }
    });
  });

  console.log(`Processing ${wordsToProcess.length} words...`);
  
  if (wordsToProcess.length === 0) return;

  // Process in batches of 50
  for (let i = 0; i < wordsToProcess.length; i += 50) {
    const batch = wordsToProcess.slice(i, i + 50);
    const prompt = `Give me a single emoji that best represents each of these French words or phrases. Return ONLY a valid JSON object mapping the ID to the emoji. Do not include markdown or codeblocks, just the JSON string starting with { and ending with }.

Words:
${batch.map(w => `${w.id}: ${w.fr} (${w.en || ''})`).join('\n')}
`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      
      let text = response.text;
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const emojis = JSON.parse(text);

      batch.forEach((w, index) => {
        const emoji = emojis[w.id] || '🤔';
        w.imageUrl = `/images/w_${w.id}.svg`;
        const color = colors[(i + index) % colors.length];
        fs.writeFileSync(`./public/images/w_${w.id}.svg`, makeSvg(emoji, color));
      });
      console.log(`Processed batch ${Math.floor(i/50) + 1}`);
      
      fs.writeFileSync('./app/data/course.json', JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Batch failed:', e);
    }
  }
  
  console.log('All done!');
}

processWords();
