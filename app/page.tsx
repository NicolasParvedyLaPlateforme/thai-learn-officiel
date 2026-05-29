import type { Metadata } from 'next';
import LandingPageClient from './components/LandingPageClient';

export const metadata: Metadata = {
  title: 'ThaiLearn - Apprenez le Thaï Facilement et Gratuitement',
  description: 'Rejoignez des milliers de personnes qui apprennent le thaï gratuitement. Leçons interactives, jeux, prononciation audio, et plus encore. Disponible sur mobile et web.',
  keywords: ['apprendre thaï', 'thaïlandais', 'leçons thaï', 'alphabet thaï', 'gratuit', 'méthode d\'apprentissage', 'thailandais', 'cours de thai'],
  openGraph: {
    title: 'ThaiLearn - Apprenez le Thaï Facilement et Gratuitement',
    description: 'La méthode d\'apprentissage du thaï interactive et gratuite la plus simple.',
    type: 'website',
    locale: 'fr_FR',
  }
};

export default function LandingPage() {
  return <LandingPageClient />;
}
