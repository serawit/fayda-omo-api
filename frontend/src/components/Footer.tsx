import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: '#37c5f9', color: '#1f2937' }} className="w-full mt-auto font-sans antialiased">
      
      {/* MAIN FOOTER CONTAINER */}
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }} className="gap-12">
          
          {/* LEFT SECTION: Branding */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="min-w-[280px]">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
              <div style={{ height: '40px', width: 'auto', flexShrink: 0 }}>
                <img 
                  src="/omo-bank-logo.webp" 
                  alt="Omo Bank" 
                  style={{ height: '100%', width: 'auto', objectFit: 'contain' }} 
                />
              </div>
              <span style={{ color: '#004b8d', fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Omo Bank
              </span>
            </Link>
            {/* Increased tagline size to 13px (base sm:text-sm) */}
            <p style={{ color: '#1f2937', fontSize: '13px', lineHeight: '1.6', maxWidth: '300px', margin: 0 }}>
              {t('footer.tagline', 'Your trusted partner in secure digital banking and Fayda ID harmonization.')}
            </p>
          </div>

          {/* RIGHT SECTION: Links */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: '80px', flexWrap: 'wrap' }}>
            
            {/* Quick Links Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* Increased header size to 12px (text-xs) */}
              <h6 style={{ color: '#004b8d', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '3px', margin: 0 }}>
                {t('common.quickLinks', 'Quick Links')}
              </h6>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Increased link size to 14px (text-sm) */}
                <li><Link to="/" className="text-[#1f2937] text-[14px] font-bold no-underline hover:text-[#004b8d] transition-colors duration-200">Home</Link></li>
                <li><a href="https://www.omobanksc.com/" target="_blank" rel="noopener noreferrer" className="text-[#1f2937] text-[14px] font-bold no-underline hover:text-[#004b8d] transition-colors duration-200">About Us</a></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* Increased header size to 12px (text-xs) */}
              <h6 style={{ color: '#004b8d', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '3px', margin: 0 }}>
                {t('common.legalSupport', 'Legal')}
              </h6>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Increased link size to 14px (text-sm) */}
                <li><Link to="/privacy" className="text-[#1f2937] text-[14px] font-bold no-underline hover:text-[#004b8d] transition-colors duration-200">Privacy Policy</Link></li>
                <li><Link to="/help" className="text-[#004b8d] text-[14px] font-black no-underline hover:text-[#003870] transition-colors duration-200">Help & FAQs</Link></li>
              </ul>
            </div>

            {/* Social Media Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h6 style={{ color: '#004b8d', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '3px', margin: 0 }}>
                {t('common.socials', 'Connect')}
              </h6>
              <div style={{ display: 'flex', gap: '15px' }}>
                <a href="https://www.facebook.com/OMFIHQ" target="_blank" rel="noopener noreferrer" className="text-[#1f2937] hover:text-[#004b8d] transition-colors duration-200" aria-label="Facebook">
                  <svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.643-4.669 1.366 0 2.625.099 2.625.099v2.881h-1.477c-1.492 0-1.96.926-1.96 1.874v2.262h3.246l-.486 3.47h-2.76v8.385c5.737-.9 10.125-5.864 10.125-11.854z"/></svg>
                </a>
                <a href="https://t.me/omobankofficial" target="_blank" rel="noopener noreferrer" className="text-[#1f2937] hover:text-[#004b8d] transition-colors duration-200" aria-label="Telegram">
                  <svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                </a>
                <a href="https://www.youtube.com/@omobankofficial" target="_blank" rel="noopener noreferrer" className="text-[#1f2937] hover:text-[#004b8d] transition-colors duration-200" aria-label="YouTube">
                  <svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="https://www.omobanksc.com" target="_blank" rel="noopener noreferrer" className="text-[#1f2937] hover:text-[#004b8d] transition-colors duration-200" aria-label="Website">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                </a>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* BOTTOM COPYRIGHT BAR */}
      <div style={{ backgroundColor: '#0a0a0a', borderTop: '1px solid #1f2937', padding: '24px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%' }} />
            {/* Increased copyright size to 11px (text-xs) */}
            <p style={{ color: '#9ca3af', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
              © {currentYear} Omo Bank S.C.
            </p>
          </div>
          {/* Increased powered-by size to 10px (text-xs/sm) */}
          <p style={{ color: '#4b5563', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
            Powered by Fayda & EthSwitch
          </p>
        </div>
      </div>
    </footer>
  );
}
