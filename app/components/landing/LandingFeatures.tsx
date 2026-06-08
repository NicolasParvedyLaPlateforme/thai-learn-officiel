import { useTranslation } from '../../hooks/useTranslation';
import { Play, Globe, Smartphone } from 'lucide-react';

export default function LandingFeatures() {
  const { t } = useTranslation();

  return (
    <section className="bg-white py-24 border-y border-slate-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{t('landing.featTitle')}</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">{t('landing.featDesc')}</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Play size={32} className="text-emerald-500 fill-emerald-500" />}
            color="bg-emerald-100"
            title={t('landing.f1Title')}
            text={t('landing.f1Desc')}
          />
          <FeatureCard 
            icon={<Globe size={32} className="text-indigo-500" />}
            color="bg-indigo-100"
            title={t('landing.f2Title')}
            text={t('landing.f2Desc')}
          />
          <FeatureCard 
            icon={<Smartphone size={32} className="text-rose-500" />}
            color="bg-rose-100"
            title={t('landing.f3Title')}
            text={t('landing.f3Desc')}
          />
        </div>
      </div>
    </section>
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
