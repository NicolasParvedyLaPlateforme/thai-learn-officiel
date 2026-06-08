import { useTranslation } from '../../hooks/useTranslation';
import Link from 'next/link';
import { BookOpen, Star, Crown } from 'lucide-react';

export default function LandingHero() {
  const { t } = useTranslation();

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
        
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-800 leading-[1.1] mb-6 drop-shadow-sm">
            {t('landing.title1')}<span className="text-emerald-500">Thaï</span>{t('landing.title2')}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-xl mx-auto md:mx-0 font-medium leading-relaxed">
            {t('landing.heroDesc')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <Link 
              href="/learn"
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 pb-5 rounded-2xl font-bold text-lg border-b-4 border-emerald-700 hover:-translate-y-1 active:translate-y-1 active:border-b-0 transition-all shadow-lg flex items-center justify-center uppercase tracking-wider"
            >
              {t('landing.startBtn')}
            </Link>
          </div>
          
          <div className="mt-8 flex items-center justify-center md:justify-start gap-4 text-sm font-bold text-slate-400 uppercase tracking-widest">
            <Star className="text-amber-400 fill-amber-400" size={18} />
            {t('landing.free')}
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            {t('landing.noAds')}
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
              <h3 className="font-extrabold text-2xl relative z-10">{t('landing.unit1')}</h3>
              <p className="text-emerald-100 mt-2 font-medium relative z-10">{t('landing.unit1Desc')}</p>
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
  );
}
