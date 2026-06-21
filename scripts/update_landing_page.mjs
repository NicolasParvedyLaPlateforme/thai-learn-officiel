import fs from 'fs';

const filePath = 'c:/xampp/htdocs/thai-learn-officiel/app/components/LandingPageClient.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove the frContent and enContent objects completely.
// We can find them using a regex.
content = content.replace(/const frContent = \{[\s\S]*?\n\};\n\nconst enContent = \{[\s\S]*?\n\};\n/m, '');

// 2. Change the component to use the translation hook.
content = content.replace(
  "  const [mounted, setMounted] = useState(false);\n  const { language, autoDetectLanguage } = useProgressStore();",
  "  const [mounted, setMounted] = useState(false);\n  const { language, autoDetectLanguage } = useProgressStore();\n  const { t } = useTranslation();"
);

// 3. Remove the `const content = (mounted && language === 'en') ? enContent : frContent;` line
content = content.replace(
  "  const content = (mounted && language === 'en') ? enContent : frContent;\n\n",
  ""
);

// 4. Replace {content.someKey} with {t('landing.someKey')}
// Also we need to replace content.someKey inside template strings like `${content.someKey}`
content = content.replace(/\{content\.([a-zA-Z0-9_]+)\}/g, "{t('landing.$1')}");
content = content.replace(/\$\{content\.([a-zA-Z0-9_]+)\}/g, "${t('landing.$1')}");

// Save it back
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated LandingPageClient.tsx');
