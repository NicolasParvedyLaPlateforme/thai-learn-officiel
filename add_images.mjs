import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./app/data/course.json', 'utf8'));

const images = [
  { keywords: ['salut', 'hello', 'bonjour'], image: 'hello.svg', emoji: '👋' },
  { keywords: ['présen', 'introduce', 'présenter'], image: 'introduce.svg', emoji: '🤝' },
  { keywords: ['chiffr', 'number', 'âge', 'age', 'numéro'], image: 'numbers.svg', emoji: '🔢' },
  { keywords: ['nourriture', 'food', 'manger', 'eat', 'faim', 'restaurant'], image: 'food.svg', emoji: '🍜' },
  { keywords: ['voyage', 'travel', 'hôtel', 'transport'], image: 'travel.svg', emoji: '✈️' },
  { keywords: ['famille', 'family'], image: 'family.svg', emoji: '👨‍👩‍👧‍👦' },
  { keywords: ['temps', 'time', 'heure'], image: 'time.svg', emoji: '⏰' },
  { keywords: ['sentiment', 'feeling', 'émotion'], image: 'feelings.svg', emoji: '😊' },
  { keywords: ['couleur', 'color'], image: 'colors.svg', emoji: '🎨' },
  { keywords: ['métier', 'job', 'travail', 'profession'], image: 'jobs.svg', emoji: '💼' },
  { keywords: ['animal', 'animaux', 'animals'], image: 'animals.svg', emoji: '🐘' },
  { keywords: ['corps', 'body'], image: 'body.svg', emoji: '💪' },
  { keywords: ['vêtement', 'cloth', 'clothes'], image: 'clothes.svg', emoji: '👕' },
  { keywords: ['maison', 'home', 'house'], image: 'house.svg', emoji: '🏠' },
  { keywords: ['météo', 'weather'], image: 'weather.svg', emoji: '⛅' }
];

let addedImages = new Set();

data.lessons.forEach(lesson => {
  let matched = false;
  for (const img of images) {
    if (lesson.title.toLowerCase().includes(img.keywords[0]) || 
        (lesson.titleEn && lesson.titleEn.toLowerCase().includes(img.keywords[1])) ||
        (lesson.descriptionEn && lesson.descriptionEn.toLowerCase().includes(img.keywords[1])) ||
        (lesson.description.toLowerCase().includes(img.keywords[0])) ||
        (img.keywords.some(k => lesson.title.toLowerCase().includes(k) || lesson.description.toLowerCase().includes(k)))
       ) {
      lesson.imageUrl = `/images/${img.image}`;
      matched = true;
      addedImages.add(img);
      break;
    }
  }
  if (!matched) {
    lesson.imageUrl = `/images/default-lesson.svg`;
  }
});

fs.writeFileSync('./app/data/course.json', JSON.stringify(data, null, 2));

const colors = ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF", "#D5BAFF", "#FFBAF2", "#B8F2E6", "#E3F4BA", "#F0C987"];

const makeSvg = (emoji, color) => `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="${color}" rx="40" />
  <text x="100" y="130" font-size="80" text-anchor="middle" font-family="sans-serif">${emoji}</text>
</svg>`;

images.forEach((img, i) => {
  fs.writeFileSync(`./public/images/${img.image}`, makeSvg(img.emoji, colors[i % colors.length]));
});

fs.writeFileSync(`./public/images/default-lesson.svg`, makeSvg('🇹🇭', '#E8ECEF'));

console.log('Done!');
