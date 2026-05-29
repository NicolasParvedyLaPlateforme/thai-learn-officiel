import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const data = JSON.parse(fs.readFileSync('./app/data/course.json', 'utf8'));

const colors = ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF", "#D5BAFF", "#FFBAF2", "#B8F2E6", "#E3F4BA", "#F0C987", "#FFC4E1", "#DCD3FF", "#BEEBE9"];
const makeSvg = (emoji, color) => `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="${color}" rx="40" />
  <text x="100" y="130" font-size="80" text-anchor="middle" font-family="sans-serif">${emoji}</text>
</svg>`;

async function processPhrases() {
  const phrasesToProcess = [];
  data.lessons.forEach(l => {
    l.phrases?.forEach(p => {
      if (!p.imageUrl) {
        phrasesToProcess.push(p);
      }
    });
  });

  console.log(`Processing ${phrasesToProcess.length} phrases...`);
  if (phrasesToProcess.length === 0) return;

  for (let i = 0; i < phrasesToProcess.length; i += 50) {
    const batch = phrasesToProcess.slice(i, i + 50);
    const prompt = `Give me a single emoji that best represents each of these French phrases. Return ONLY a valid JSON object mapping the ID to the emoji. Do not include markdown or codeblocks, just the JSON string starting with { and ending with }.

Phrases:
${batch.map(p => `${p.id}: ${p.fr} (${p.en || ''})`).join('\n')}
`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      
      let text = response.text;
      text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      const emojis = JSON.parse(text);

      batch.forEach((p, index) => {
        const emoji = emojis[p.id] || '🤔';
        p.imageUrl = `/images/p_${p.id}.svg`;
        const color = colors[(i + index) % colors.length];
        fs.writeFileSync(`./public/images/p_${p.id}.svg`, makeSvg(emoji, color));
      });
      console.log(`Processed batch ${Math.floor(i/50) + 1}`);
      
      fs.writeFileSync('./app/data/course.json', JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Batch failed:', e);
    }
  }
  
  console.log('All done!');
}

processPhrases();
