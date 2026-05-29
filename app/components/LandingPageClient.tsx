'use client';

import Link from 'next/link';
import { BookOpen, Globe, CheckCircle, Smartphone, Star, Play, Crown, Volume2, MessageCircle, Type, LayoutGrid, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useProgressStore } from '../lib/store';
import PWAInstallButton from './PWAInstallButton';

const frContent = {
  title1: 'Apprenez le ',
  title2: ' de la bonne façon.',
  heroDesc: 'La méthode la plus amusante, efficace et gratuite pour apprendre le thaïlandais. Parlez dès le premier jour, pratiquez l\'écriture et maîtrisez l\'alphabet étape par étape.',
  startBtn: 'Commencer l\'apprentissage',
  free: 'Totalement Gratuit',
  noAds: 'Sans Pubs',
  unit1: 'Unité 1 : Les bases',
  unit1Desc: 'Commencez votre voyage en thaï !',
  methodTitle: 'Une méthode complète et variée',
  methodDesc: 'Ne vous ennuyez jamais avec une multitude d\'exercices conçus pour améliorer chaque aspect de votre apprentissage du thaï.',
  pairMatchTitle: 'Relier les paires',
  pairMatchDesc: 'Apprenez le vocabulaire en associant les mots thaïlandais à leur traduction. Avec ou sans l\'audio, avec ou sans le texte. Relevez le défi pour muscler votre mémoire.',
  sentenceTitle: 'Construire des phrases',
  sentenceDesc: 'Ne vous limitez pas à du vocabulaire. Apprenez très vite à produire vos propres phrases en assemblant les mots dans le bon ordre.',
  sentenceTrTip: 'Traduisez cette phrase',
  sentenceTrB1: 'bonjour (femme)',
  vocabTip: '💡 VOCABULAIRE UTILE :',
  partF: '= particule femme',
  out: '= sortir',
  big: '= grand',
  hello: '= bonjour',
  formHere: 'Formez la phrase ici...',
  audioTitle: 'Compréhension Orale',
  audioDesc: 'Le thaï est une langue tonale. Éduquez votre oreille avec nos exercices de compréhension orale 100% audio, et choisissez la bonne réponse parmi plusieurs options.',
  cat: 'Chat',
  dog: 'Chien',
  bird: 'Oiseau',
  fish: 'Poisson',
  writeTitle: 'Écrire des mots',
  writeDesc: 'Pratiquez l\'orthographe en assemblant les bonnes consonnes et voyelles pour former des mots complets en thaï. Une aide intelligente est à votre disposition en cas de difficulté.',
  writeWord: 'Écrivez ce mot en thaï',
  one: 'un',
  consTip: "💡 Consonne 'h' (Ho Nam). Ici, elle sera muette et modifiera le ton de la consonne suivante.",
  writeHere: 'Écrivez ici...',
  discussTitle: 'Dialogues interactifs',
  discussDesc: 'Écoutez des conversations et entraînez-vous à répondre en choisissant la bonne option selon le contexte.',
  alphaTitle: 'Maîtriser l\'Alphabet',
  alphaDesc: 'Mémorisez les consonnes et voyelles avec des moyens mnémotechniques simples et ludiques.',
  metricsTitle: 'Près de 1000 mots et phrases classés',
  metricsDesc: "Une base de données riche et étudiée, pensée pour vous faire progresser des bases jusqu'aux discussions avancées.",
  featTitle: 'Pourquoi choisir ThaiLearn ?',
  featDesc: 'Notre méthode interactive se concentre sur ce dont vous avez besoin pour communiquer rapidement.',
  f1Title: 'Apprentissage par le jeu',
  f1Desc: 'Associez, complétez et construisez des phrases courtes de manière interactive pour retenir le vocabulaire sans effort.',
  f2Title: 'Phonétique & Audio',
  f2Desc: 'Chaque mot possède une prononciation au format phonétique et audio de haute qualité avec les accents justes.',
  f3Title: 'L\'écriture facilitée',
  f3Desc: 'Apprenez à orthographier vos premiers mots en sélectionnant visuellement les consonnes et voyelles appropriées.',
  ctaTitle: 'Apprenez le thaï dès maintenant.',
  ctaDesc: 'Rejoignez-nous et commencez l\'Unité 1. Mettez-vous directement dans le bain, aucune inscription requise pour commencer !',
  ctaBtn: "C'est parti !",
  footer: `© ${new Date().getFullYear()} ThaiLearn. Apprendre le thaï n'a jamais été aussi facile.`
};

const enContent = {
  title1: 'Learn ',
  title2: ' the right way.',
  heroDesc: 'The most fun, effective, and free way to learn Thai. Speak from day one, practice writing, and master the alphabet step by step.',
  startBtn: 'Start Learning',
  free: 'Completely Free',
  noAds: 'No Ads',
  unit1: 'Unit 1: The Basics',
  unit1Desc: 'Start your Thai journey!',
  methodTitle: 'A complete and varied method',
  methodDesc: 'Never get bored with a multitude of exercises designed to improve every aspect of your Thai learning.',
  pairMatchTitle: 'Match Pairs',
  pairMatchDesc: 'Learn vocabulary by matching Thai words to their translation. With or without audio, with or without text. Challenge yourself to build your memory.',
  sentenceTitle: 'Build Sentences',
  sentenceDesc: 'Don\'t limit yourself to vocabulary. Quickly learn to produce your own sentences by assembling words in the right order.',
  sentenceTrTip: 'Translate this sentence',
  sentenceTrB1: 'hello (female)',
  vocabTip: '💡 USEFUL VOCABULARY :',
  partF: '= female particle',
  out: '= to go out',
  big: '= big',
  hello: '= hello',
  formHere: 'Build the sentence here...',
  audioTitle: 'Listening Comprehension',
  audioDesc: 'Thai is a tonal language. Train your ear with our 100% audio listening exercises, and choose the right answer from multiple options.',
  cat: 'Cat',
  dog: 'Dog',
  bird: 'Bird',
  fish: 'Fish',
  writeTitle: 'Write Words',
  writeDesc: 'Practice spelling by assembling the right consonants and vowels to form complete Thai words. Smart help is available if you get stuck.',
  writeWord: 'Write this word in Thai',
  one: 'one',
  consTip: "💡 Consonant 'h' (Ho Nam). Here, it will be silent and change the tone of the following consonant.",
  writeHere: 'Write here...',
  discussTitle: 'Interactive Dialogues',
  discussDesc: 'Listen to real conversations and practice answering them by picking the right response according to context.',
  alphaTitle: 'Master the Alphabet',
  alphaDesc: 'Memorize consonants and vowels with simple and fun mnemonic devices.',
  metricsTitle: 'Nearly 1000 ranked words and phrases',
  metricsDesc: "A rich and carefully studied database, designed to take you from the basics to advanced discussions.",
  featTitle: 'Why choose ThaiLearn?',
  featDesc: 'Our interactive method focuses on what you need to communicate quickly.',
  f1Title: 'Learning through play',
  f1Desc: 'Match, complete and build short sentences interactively to retain vocabulary effortlessly.',
  f2Title: 'Phonetics & Audio',
  f2Desc: 'Every word has pronunciation in phonetic format and high-quality audio with the right accents.',
  f3Title: 'Writing made easy',
  f3Desc: 'Learn to spell your first words by visually selecting the appropriate consonants and vowels.',
  ctaTitle: 'Learn Thai right now.',
  ctaDesc: 'Join us and start Unit 1. Jump right in, no registration required to begin!',
  ctaBtn: "Let's go!",
  footer: `© ${new Date().getFullYear()} ThaiLearn. Learning Thai has never been easier.`
};

export default function LandingPageClient() {
  const [mounted, setMounted] = useState(false);
  const { language, autoDetectLanguage } = useProgressStore();

  useEffect(() => {
    setMounted(true);
    autoDetectLanguage();
    
    // Redirect returning users directly to the app
    const { completedLessons } = useProgressStore.getState();
    if (completedLessons && completedLessons.length > 0) {
      window.location.replace('/learn');
    }
  }, [autoDetectLanguage]);

  const content = (mounted && language === 'en') ? enContent : frContent;

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800">
      
      {/* Navbar */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center max-w-6xl mx-auto z-10 w-full">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-md border-b-4 border-emerald-700">
            <BookOpen size={28} />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-800">ThaiLearn</span>
        </div>
        <div className="flex items-center gap-2">
          {mounted && <PWAInstallButton />}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-800 leading-[1.1] mb-6 drop-shadow-sm">
              {content.title1}<span className="text-emerald-500">Thaï</span>{content.title2}
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-xl mx-auto md:mx-0 font-medium leading-relaxed">
              {content.heroDesc}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <Link 
                href="/learn"
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 pb-5 rounded-2xl font-bold text-lg border-b-4 border-emerald-700 hover:-translate-y-1 active:translate-y-1 active:border-b-0 transition-all shadow-lg flex items-center justify-center uppercase tracking-wider"
              >
                {content.startBtn}
              </Link>
            </div>
            
            <div className="mt-8 flex items-center justify-center md:justify-start gap-4 text-sm font-bold text-slate-400 uppercase tracking-widest">
              <Star className="text-amber-400 fill-amber-400" size={18} />
              {content.free}
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              {content.noAds}
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-md relative flex justify-center">
            {/* Mockup or Illustration Placeholder */}
            <div className="relative w-full aspect-[4/5] bg-white rounded-[3rem] shadow-2xl border-[8px] border-slate-100 overflow-hidden flex flex-col pt-8 px-6 transform rotate-2 md:rotate-3 hover:rotate-1 transition-transform duration-500">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-100 rounded-b-3xl"></div>
              
              {/* App UI fragment to show how it looks */}
              <div className="flex items-center justify-between mb-8">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-500 rounded-xl flex items-center justify-center">
                  <BookOpen size={20} />
                </div>
                <div className="flex items-center gap-1 text-rose-500 font-bold">
                  <Star size={16} className="fill-rose-500" />
                  250 XP
                </div>
              </div>
              
              <div className="bg-emerald-500 text-white rounded-3xl p-6 mb-6 shadow-md border-b-4 border-emerald-700 relative overflow-hidden">
                <h3 className="font-extrabold text-2xl relative z-10">{content.unit1}</h3>
                <p className="text-emerald-100 mt-2 font-medium relative z-10">{content.unit1Desc}</p>
                <BookOpen size={100} className="absolute -bottom-6 -right-6 text-black opacity-10" />
              </div>
              
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="w-20 h-20 bg-emerald-400 rounded-[2rem] border-b-4 border-emerald-600 flex justify-center items-center text-white scale-110">
                  <Crown fill="currentColor" size={32} />
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-8 w-full max-w-[12rem] mx-auto opacity-40">
                <div className="w-full h-4 bg-emerald-500 rounded-full"></div>
              </div>
              
            </div>
            
            {/* Floating elements */}
            <div className="absolute -left-12 top-20 bg-white p-4 pb-5 rounded-2xl shadow-xl border-2 border-slate-100 border-b-4 border-b-slate-200 animate-bounce" style={{ animationDuration: '3s' }}>
              <span className="text-3xl">🇹🇭</span>
            </div>
            <div className="absolute -right-8 bottom-32 bg-amber-400 text-white p-4 pb-5 rounded-2xl shadow-xl border-b-4 border-amber-600 font-black flex items-center gap-2 transform rotate-12">
              <Star className="fill-white" size={24} />
              +50 XP
            </div>
          </div>
          
        </div>
      </section>

      {/* Exercise Showcase Section */}
      <section className="bg-slate-50 py-24 border-t border-slate-200 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-slate-800">{content.methodTitle}</h2>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium">{content.methodDesc}</p>
          </div>

          <div className="flex flex-col gap-24">
            
            {/* Showcase 1: Pair Matching */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-3">
                  <div className="bg-indigo-100 text-indigo-500 p-2 rounded-xl">
                    <CheckCircle size={24} />
                  </div>
                  {content.pairMatchTitle}
                </h3>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">
                  {content.pairMatchDesc}
                </p>
              </div>
              <div className="flex-1 w-full max-w-md bg-white p-6 rounded-[2.5rem] shadow-xl border-[6px] border-slate-100 transform rotate-1 hover:rotate-0 transition-all">
                <div className="grid grid-cols-2 gap-3">
                  {/* Left column / Right Column */}
                  <div className="bg-white p-4 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 shadow-sm flex items-center justify-center min-h-[4.5rem]">deux mois</div>
                  <div className="bg-white p-4 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 shadow-sm flex items-center justify-center min-h-[4.5rem] text-xl">สอง</div>
                  <div className="bg-white p-4 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 shadow-sm flex items-center justify-center min-h-[4.5rem]">deux</div>
                  <div className="bg-white p-4 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 shadow-sm flex items-center justify-center min-h-[4.5rem] text-xl">หนึ่งปี</div>
                  <div className="bg-white p-4 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 shadow-sm flex items-center justify-center min-h-[4.5rem]">un an</div>
                  <div className="bg-white p-4 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 shadow-sm flex items-center justify-center min-h-[4.5rem] text-xl">สองเดือน</div>
                  <div className="bg-slate-100 p-4 rounded-xl border-2 border-slate-200 text-center font-bold text-slate-400 flex items-center justify-center min-h-[4.5rem] opacity-50">dix</div>
                  <div className="bg-indigo-100 p-4 rounded-xl border-2 border-indigo-300 border-b-4 text-center font-bold text-indigo-600 shadow-sm flex items-center justify-center min-h-[4.5rem] text-xl animate-pulse">สิบ</div>
                </div>
              </div>
            </div>

            {/* Showcase 2: Sentence Building */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-3">
                  <div className="bg-fuchsia-100 text-fuchsia-500 p-2 rounded-xl">
                    <BookOpen size={24} />
                  </div>
                  {content.sentenceTitle}
                </h3>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">
                  {content.sentenceDesc}
                </p>
              </div>
              <div className="flex-1 w-full max-w-lg bg-[#FAFAFA] p-8 rounded-[2.5rem] shadow-xl border-[6px] border-slate-100 transform -rotate-1 hover:rotate-0 transition-all flex flex-col items-center">
                
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[2rem] bg-indigo-50 border-[6px] border-indigo-100 flex items-center justify-center text-4xl sm:text-5xl shadow-sm mb-4">
                  🙏
                </div>
                
                <div className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight text-center relative w-fit mb-6">
                  {content.sentenceTrB1} {/* Translate to 'merci (femme)' / 'hello (female)' */}
                  <div className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-slate-300 border-b border-dashed border-slate-400 opacity-50"></div>
                  <div className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-transparent border-b border-dashed border-white opacity-50 translate-y-px"></div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-6 w-full max-w-xs cursor-pointer hover:bg-slate-100 transition-colors flex justify-between items-center px-4">
                  <div className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
                    💡 {language === 'en' ? 'USEFUL VOCABULARY' : 'VOCABULAIRE UTILE'}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="m6 9 6 6 6-6"></path></svg>
                </div>

                <div className="border-t-2 border-b-2 border-slate-200 py-6 mb-8 min-h-[6rem] flex items-center justify-center gap-2 w-full">
                   <span className="text-slate-400 font-medium text-sm tracking-wide">{content.formHere}</span>
                </div>

                <div className="flex gap-3 justify-center w-full">
                   <div className="bg-white p-3 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 shadow-sm hover:-translate-y-1 transition-transform cursor-pointer text-xl min-w-[5rem] font-thai">ขอบคุณ</div>
                   <div className="bg-white p-3 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 shadow-sm hover:-translate-y-1 transition-transform cursor-pointer text-xl min-w-[5rem] font-thai">ค่ะ</div>
                </div>
              </div>
            </div>

            {/* Showcase 3: Audio comprehension */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-3">
                  <div className="bg-sky-100 text-sky-500 p-2 rounded-xl">
                    <Volume2 size={24} />
                  </div>
                  {content.audioTitle}
                </h3>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">
                  {content.audioDesc}
                </p>
              </div>
              <div className="flex-1 w-full max-w-md bg-white p-6 rounded-[2.5rem] shadow-xl border-[6px] border-slate-100 transform rotate-1 hover:rotate-0 transition-all flex flex-col items-center">
                <div className="w-24 h-24 bg-sky-500 rounded-3xl mb-8 flex items-center justify-center text-white border-b-[6px] border-sky-700 shadow-lg animate-pulse" style={{ animationDuration: '3s' }}>
                  <Volume2 size={48} />
                </div>
                
                <div className="grid grid-cols-2 gap-3 w-full">
                  <div className="bg-white p-4 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 hover:-translate-y-1 transition-all cursor-pointer">
                    {content.cat}
                  </div>
                  <div className="bg-white p-4 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 hover:-translate-y-1 transition-all cursor-pointer">
                    {content.dog}
                  </div>
                  <div className="bg-sky-100 p-4 rounded-xl border-2 border-sky-400 border-b-4 text-center font-bold text-sky-700 scale-105 shadow-sm transition-all cursor-pointer">
                    {content.bird}
                  </div>
                  <div className="bg-white p-4 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 hover:-translate-y-1 transition-all cursor-pointer">
                    {content.fish}
                  </div>
                </div>
              </div>
            </div>

            {/* Showcase 4: Writing */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-3">
                  <div className="bg-rose-100 text-rose-500 p-2 rounded-xl">
                    <Smartphone size={24} />
                  </div>
                  {content.writeTitle}
                </h3>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">
                  {content.writeDesc}
                </p>
              </div>
              <div className="flex-1 w-full max-w-lg bg-white p-8 rounded-[2.5rem] shadow-xl border-[6px] border-slate-100 transform -rotate-1 hover:rotate-0 transition-all flex flex-col">
                <div className="flex items-start gap-4 mb-6">
                   <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-3xl">
                     ✍️
                   </div>
                   <div>
                     <h4 className="text-2xl font-bold text-slate-800">{content.writeWord}</h4>
                     <p className="text-lg text-slate-600 mt-1">{content.one}</p>
                     <p className="text-sm font-mono text-slate-500 mt-1">[<span className="bg-amber-100 text-amber-700 px-1 rounded">n</span>ùeng]</p>
                   </div>
                </div>

                <div className="flex gap-2 mb-6">
                  <div className="bg-slate-50 px-6 py-4 rounded-2xl border-2 border-slate-200 flex items-center justify-center gap-1">
                    <span className="text-3xl text-orange-500 font-bold">ห</span>
                    <span className="text-3xl text-slate-300 font-bold opacity-50">น เ ่ ง</span>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8 text-orange-800 text-sm flex gap-3 items-start shadow-sm">
                   <span className="text-lg">💡</span> {content.consTip}
                </div>

                <div className="border-t-2 border-b-2 border-slate-100 py-6 mb-8 flex items-center justify-center">
                   <span className="text-slate-400 font-medium">{content.writeHere}</span>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                   <div className="bg-white w-12 h-14 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 shadow-sm flex items-center justify-center text-2xl hover:-translate-y-1 transition-transform cursor-pointer">น</div>
                   <div className="bg-white w-12 h-14 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 shadow-sm flex items-center justify-center text-2xl hover:-translate-y-1 transition-transform cursor-pointer">ง</div>
                   <div className="bg-white w-12 h-14 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 shadow-sm flex items-center justify-center text-2xl hover:-translate-y-1 transition-transform cursor-pointer">เ่</div>
                   <div className="bg-slate-100 w-12 h-14 rounded-xl border-2 border-slate-200 text-center font-bold text-slate-400 flex items-center justify-center text-2xl opacity-50">ห</div>
                   <div className="bg-white w-12 h-14 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 shadow-sm flex items-center justify-center text-2xl hover:-translate-y-1 transition-transform cursor-pointer">-</div>
                   <div className="bg-slate-100 w-12 h-14 rounded-xl border-2 border-slate-200 text-center text-slate-400 flex items-center justify-center">⌫</div>
                </div>
              </div>
            </div>

            {/* Showcase 5: Discussions */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-3">
                  <div className="bg-amber-100 text-amber-500 p-2 rounded-xl">
                    <MessageCircle size={24} />
                  </div>
                  {content.discussTitle}
                </h3>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">
                  {content.discussDesc}
                </p>
              </div>
              <div className="flex-1 w-full max-w-md bg-white p-6 rounded-[2.5rem] shadow-xl border-[6px] border-slate-100 transform rotate-1 hover:rotate-0 transition-all flex flex-col">
                <div className="flex flex-col gap-4">
                  <div className="flex gap-3">
                     <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-300 flex-shrink-0 relative overflow-hidden">
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-slate-400 rounded-t-full"></div>
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-400 rounded-full"></div>
                     </div>
                     <div className="bg-slate-100 p-4 rounded-3xl rounded-tl-sm border-2 border-slate-200">
                        <div className="w-24 h-3 bg-slate-300 rounded mb-2"></div>
                        <div className="w-16 h-3 bg-slate-300 rounded"></div>
                     </div>
                  </div>
                  
                  <div className="flex gap-3 flex-row-reverse">
                     <div className="w-10 h-10 rounded-full bg-orange-100 border-2 border-orange-200 flex-shrink-0 relative overflow-hidden">
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-orange-300 rounded-t-full"></div>
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-orange-300 rounded-full"></div>
                     </div>
                     <div className="bg-orange-50 p-4 rounded-3xl rounded-tr-sm border-2 border-orange-200 shadow-[0_0_0_4px_rgba(251,146,60,0.3)]">
                        <div className="flex gap-1">
                           <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                           <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                           <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                     </div>
                  </div>
                </div>
                
                <div className="mt-8 border-t-2 border-slate-100 pt-4 flex flex-col gap-2">
                   <div className="bg-emerald-50 border-2 border-b-4 border-emerald-400 rounded-xl p-3 text-emerald-900 font-bold flex justify-between items-center shadow-sm relative">
                      <span className="font-thai">{language === 'en' ? 'Sawatdee Kha' : 'Sawatdee Kha'}</span>
                      <Check size={18} className="text-emerald-500" />
                   </div>
                   <div className="bg-white border-2 border-b-4 border-slate-200 rounded-xl p-3 text-slate-800 font-bold opacity-50 relative">
                      <span className="font-thai">{language === 'en' ? 'Khop Khun Kha' : 'Khop Khun Kha'}</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Showcase 6: Alphabet */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-3">
                  <div className="bg-rose-100 text-rose-500 p-2 rounded-xl">
                    <Type size={24} />
                  </div>
                  {content.alphaTitle}
                </h3>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">
                  {content.alphaDesc}
                </p>
              </div>
              <div className="flex-1 w-full max-w-lg flex items-center justify-center transform -rotate-2 hover:rotate-0 transition-all">
                {/* Alphabet Card representation */}
                <div className="w-64 h-64 rounded-3xl border-2 border-teal-200 bg-teal-100 shadow-xl overflow-hidden flex flex-col items-center justify-center p-4 relative font-sans">
                  <div className="absolute top-3 left-0 right-0 text-center text-xs font-bold uppercase tracking-wider text-teal-600 opacity-80">
                     Mid Class
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center justify-center w-full relative">
                    <span className="text-8xl font-bold text-teal-600 opacity-20 absolute select-none pointer-events-none font-thai">
                      ก
                    </span>
                    <div className="z-10 text-center flex flex-col items-center justify-center h-full pt-4">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-28 h-28 rounded-full bg-white bg-opacity-60 border-2 border-dashed border-teal-200 flex items-center justify-center relative shadow-inner">
                              <span className="text-6xl absolute z-0 opacity-40 filter drop-shadow-sm mix-blend-multiply">🐔</span>
                              <span className="text-7xl font-medium text-teal-600 z-10 drop-shadow-md font-thai">ก</span>
                          </div>
                          <p className="text-[15px] font-semibold mt-1 text-teal-600 px-2 leading-tight text-center max-w-[90%] font-sans">
                            {language === 'en' ? 'Chicken' : 'Poulet'}
                          </p>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="bg-emerald-500 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">{content.metricsTitle}</h2>
          <p className="text-emerald-100 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            {content.metricsDesc}
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white py-24 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{content.featTitle}</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">{content.featDesc}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Play size={32} className="text-emerald-500 fill-emerald-500" />}
              color="bg-emerald-100"
              title={content.f1Title}
              text={content.f1Desc}
            />
            <FeatureCard 
              icon={<Globe size={32} className="text-indigo-500" />}
              color="bg-indigo-100"
              title={content.f2Title}
              text={content.f2Desc}
            />
            <FeatureCard 
              icon={<Smartphone size={32} className="text-rose-500" />}
              color="bg-rose-100"
              title={content.f3Title}
              text={content.f3Desc}
            />
          </div>
        </div>
      </section>
      
      {/* Bottom CTA */}
      <section className="bg-slate-800 text-white py-24 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 relative z-10 text-white">{content.ctaTitle}</h2>
        <p className="text-xl text-slate-300 mb-10 max-w-xl mx-auto relative z-10 font-medium">{content.ctaDesc}</p>
        <Link 
          href="/learn"
          className="inline-flex w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-white px-10 py-5 pb-6 rounded-2xl font-black text-xl border-b-[6px] border-emerald-700 hover:-translate-y-1 active:translate-y-1 active:border-b-0 transition-all shadow-xl items-center justify-center uppercase tracking-widest relative z-10"
        >
          {content.ctaBtn}
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-500 py-8 text-center text-sm font-medium">
        <p>{content.footer}</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, text, color }: { icon: React.ReactNode, title: string, text: string, color: string }) {
  return (
    <div className="bg-slate-50 p-8 rounded-3xl border-2 border-slate-100 flex flex-col items-center text-center hover:border-emerald-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border-b-4 border-slate-200/50 ${color}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-800">{title}</h3>
      <p className="text-slate-500 leading-relaxed font-medium">{text}</p>
    </div>
  );
}
