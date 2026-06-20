import { useTranslation } from "@/hooks/useTranslation";

export default function LandingMetrics() {
  const { t } = useTranslation();

  return (
    <section className="bg-emerald-500 py-16">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">{t('landing.metricsTitle')}</h2>
        <p className="text-emerald-100 text-lg md:text-xl font-medium max-w-2xl mx-auto">
          {t('landing.metricsDesc')}
        </p>
      </div>
    </section>
  );
}
