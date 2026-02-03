import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function HelpAndFAQs() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { id: 1, q: 'faq_q1', a: 'faq_a1' },
    { id: 2, q: 'faq_q2', a: 'faq_a2' },
    { id: 3, q: 'faq_q3', a: 'faq_a3' },
    { id: 4, q: 'faq_q4', a: 'faq_a4' },
    { id: 5, q: 'faq_q5', a: 'faq_a5' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('help.errors.nameRequired');
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('help.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('help.errors.emailInvalid');
    }
    
    if (!formData.subject) {
      newErrors.subject = t('help.errors.subjectRequired');
    }
    
    if (!formData.message.trim()) {
      newErrors.message = t('help.errors.messageRequired');
    } else if (formData.message.length < 10) {
      newErrors.message = t('help.errors.messageMinLength');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setStatus(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-3xl">
        <div className="auth-card !max-w-none text-left p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-omo-brand mb-4">
                {t('help.title') || 'Contact Support'}
              </h1>
              <p className="text-gray-600">
                {t('help.subtitle') || 'Have questions? We are here to help.'}
              </p>
            </div>

            {status === 'success' && (
              <div className="mb-8 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 flex items-center gap-3">
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {t('help.successMessage') || 'Your message has been sent successfully. We will get back to you soon.'}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">{t('help.nameLabel') || 'Full Name'}</label>
                  <input
                    type="text"
                    id="name"
                    className={`input-field ${errors.name ? 'error' : ''
                    }`}
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                  {errors.name && <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t('help.emailLabel') || 'Email Address'}</label>
                  <input
                    type="email"
                    id="email"
                    className={`input-field ${errors.email ? 'error' : ''
                    }`}
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                  {errors.email && <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">{t('help.subjectLabel') || 'Subject'}</label>
                <select
                  id="subject"
                  className={`input-field ${errors.subject ? 'error' : ''
                  }`}
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                >
                  <option value="">{t('help.selectSubject') || 'Select a topic'}</option>
                  <option value="account">{t('help.topicAccount') || 'Account Issues'}</option>
                  <option value="fayda">{t('help.topicFayda') || 'Fayda Linking'}</option>
                  <option value="technical">{t('help.topicTechnical') || 'Technical Support'}</option>
                  <option value="other">{t('help.topicOther') || 'Other'}</option>
                </select>
                {errors.subject && <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.subject}</p>}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">{t('help.messageLabel') || 'Message'}</label>
                <textarea
                  id="message"
                  rows={5}
                  className={`input-field resize-none ${errors.message ? 'error' : ''
                  }`}
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                ></textarea>
                {errors.message && <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (t('help.sending') || 'Sending...') : (t('help.submitBtn') || 'Send Message')}
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="w-full mt-12 mb-8">
          <h2 className="text-2xl font-bold text-omo-brand mb-6 text-center">
            {t('faq.title') || 'Frequently Asked Questions'}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="faq-item">
                <button
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="w-full px-5 py-3.5 text-left flex justify-between items-center focus:outline-none hover:bg-gray-50 transition-colors"
                  aria-expanded={openFaq === faq.id}
                >
                  <span className="font-medium text-gray-900 text-sm">{t(faq.q)}</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${openFaq === faq.id ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`px-5 text-gray-600 text-sm transition-all duration-300 ease-in-out overflow-hidden ${
                    openFaq === faq.id ? 'max-h-96 py-3.5 opacity-100 border-t border-gray-100' : 'max-h-0 py-0 opacity-0'
                  }`}
                >
                  {t(faq.a)}
                </div>
              </div>
            ))}
          </div>

          {/* Direct Support Section */}
          <div className="mt-10 bg-blue-50 rounded-2xl p-6 border border-blue-100 text-center">
            <h3 className="text-lg font-bold text-omo-brand mb-2">
              {t('need_help_title')}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {t('call_center')}
            </p>
            <a href="tel:9555" className="btn-secondary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 12.284 3 5z"/></svg>
              9555
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}