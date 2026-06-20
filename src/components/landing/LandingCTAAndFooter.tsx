import { useTranslation } from "@/hooks/useTranslation";
import Link from 'next/link';

export default function LandingCTAAndFooter() {
  const { t } = useTranslation();

  return (
    <>
      {/* Bottom CTA */}
      <section className="bg-slate-800 text-white py-24 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 relative z-10 text-white">{t('landing.ctaTitle')}</h2>
        <p className="text-xl text-slate-300 mb-10 max-w-xl mx-auto relative z-10 font-medium">{t('landing.ctaDesc')}</p>
        <Link 
          href="/learn"
          className="inline-flex w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-white px-10 py-5 pb-6 rounded-2xl font-black text-xl border-b-[6px] border-emerald-700 hover:-translate-y-1 active:translate-y-1 active:border-b-0 transition-all shadow-xl items-center justify-center uppercase tracking-widest relative z-10"
        >
          {t('landing.ctaBtn')}
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-500 py-8 text-center text-sm font-medium">
        <p>{t('landing.footer')}</p>
      </footer>
    </>
  );
}
