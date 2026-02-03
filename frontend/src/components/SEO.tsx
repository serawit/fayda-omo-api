import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  structuredData?: object;
  breadcrumbs?: { name: string; item: string }[];
}

export default function SEO({ title, description, image, url, structuredData, breadcrumbs }: SEOProps) {
  const origin = window.location.origin;

  const siteTitle = title ? `${title} | Omo Bank S.C.` : 'Omo Bank S.C. | Fayda Harmonization Portal';
  const siteDescription = description || 'Securely link your National ID (Fayda) with your Omo Bank account. Fast, secure, and online harmonization service.';
  const siteImage = image ? (image.startsWith('http') ? image : `${origin}${image}`) : `${origin}/omo-bank-logo.png`;
  const siteUrl = url || window.location.href;

  let breadcrumbJsonLd = null;
  if (breadcrumbs && breadcrumbs.length > 0) {
    breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": crumb.item.startsWith('http') ? crumb.item : `${origin}${crumb.item}`
      }))
    };
  }

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
      <link rel="canonical" href={siteUrl} />
      
      {/* Google Search Console Verification */}
      <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={siteImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={siteUrl} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={siteDescription} />
      <meta property="twitter:image" content={siteImage} />

      {structuredData && (
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      )}

      {breadcrumbJsonLd && (
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      )}
    </Helmet>
  );
}