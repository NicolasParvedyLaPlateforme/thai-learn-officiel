import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./app/data/course.json', 'utf8'));

const imagesMap = {
  'w_sawatdee': { emoji: '👋', name: 'hello_word.svg' },
  'w_khopkhun': { emoji: '🙏', name: 'thanks_word.svg' },
  'w_krap': { emoji: '👨', name: 'man_word.svg' },
  'w_kha': { emoji: '👩', name: 'woman_word.svg' },
  'w_sabai': { emoji: '😌', name: 'sabai_word.svg' },
  'w_dee': { emoji: '👍', name: 'good_word.svg' },
  'w_mai': { emoji: '❓', name: 'question_word.svg' }
};

if (data.lessons[0]) {
  data.lessons[0].words.forEach(word => {
    const config = imagesMap[word.id];
    if (config) {
      word.imageUrl = `/images/${config.name}`;
    }
  });
}

fs.writeFileSync('./app/data/course.json', JSON.stringify(data, null, 2));

const colors = ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF", "#D5BAFF", "#FFBAF2", "#B8F2E6", "#E3F4BA", "#F0C987"];

const makeSvg = (emoji, color) => `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="${color}" rx="40" />
  <text x="100" y="130" font-size="80" text-anchor="middle" font-family="sans-serif">${emoji}</text>
</svg>`;

Object.values(imagesMap).forEach((config, i) => {
  fs.writeFileSync(`./public/images/${config.name}`, makeSvg(config.emoji, colors[i % colors.length]));
});

console.log('Words updated with images');
