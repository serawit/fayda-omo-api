import { useTranslation } from 'react-i18next';
import './FeaturesSection.css';

export default function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    {
      id: 1,
      title: t('home.benefit1') || 'Instant Verification',
      description: t('home.benefit1Desc') || 'Real-time identity verification against the National ID database for immediate account linking.',
      icon: (
        <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 2,
      title: t('home.benefit2') || 'Enhanced Security',
      description: t('home.benefit2Desc') || 'Bank-grade encryption and biometric validation ensure your account remains secure.',
      icon: (
        <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      id: 3,
      title: t('home.benefit3') || 'Digital Access',
      description: t('home.benefit3Desc') || 'Unlock full access to digital banking services and future financial products.',
      icon: (
        <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ];

  return (
    <section id="features" className="w-full py-16 scroll-mt-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-[var(--color-text)] mb-4">
          {t('home.featuresTitle') || 'Key Features'}
        </h2>
        <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
          {t('home.featuresSubtitle') || 'Experience the benefits of linking your National ID with Omo Bank.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature) => (
          <div key={feature.id} className="bg-white p-8 rounded-[var(--radius-lg)] shadow-sm border border-[var(--color-border)] hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-6 mx-auto text-[var(--color-primary)]">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text)] mb-3 text-center">
              {feature.title}
            </h3>
            <p className="text-[var(--color-text-secondary)] text-center">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}