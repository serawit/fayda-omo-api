// src/components/HowItWorksSection.tsx
import { useTranslation } from 'react-i18next';

export default function HowItWorksSection() {
  const { t } = useTranslation();

  const steps = [
    {
      id: 1,
      title: t('home.step1Title') || 'Enter Account Number',
      description: t('home.step1Desc') || 'Provide your Omo Bank account number to initiate the harmonization process.',
      icon: (
        <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      id: 2,
      title: t('home.step2Title') || 'Verify Fayda ID',
      description: t('home.step2Desc') || 'Enter your 12-digit Fayda ID and confirm your identity securely.',
      icon: (
        <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 2c-2.761 0-5 2.239-5 5h10c0-2.761-2.239-5-5-5z" />
        </svg>
      ),
    },
    {
      id: 3,
      title: t('home.step3Title') || 'Accounts Linked',
      description: t('home.step3Desc') || 'Your Fayda ID is now securely connected to your Omo Bank account.',
      icon: (
        <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-12 bg-gray-50 w-full">
      <div className="max-w-[1200px] mx-auto px-5 flex flex-col items-center">
        <div className="text-center mb-10">
          <span className="text-[var(--color-primary)] font-bold tracking-wider uppercase text-sm">Process</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mt-2 mb-4">
            {t('home.howItWorksTitle') || 'How It Works'}
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            {t('home.howItWorksSubtitle') || 'Link your Fayda ID to your Omo Bank account in three simple steps.'}
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 -z-10 animate-flow"></div>

          {steps.map((step) => (
            <div key={step.id} className="relative flex flex-col items-center text-center group w-full">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-gray-50 mb-6 group-hover:border-[var(--color-primary)] transition-colors duration-300">
                <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center shadow-sm transform group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                <div className="absolute top-0 right-0 bg-[var(--color-primary)] rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow-sm font-bold text-white">
                  {step.id}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">
                {step.title}
              </h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}