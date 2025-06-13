import { Helmet } from 'react-helmet';

interface JsonLdOrganization {
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
  description?: string;
}

interface JsonLdWebPage {
  title: string;
  description: string;
  url: string;
}

interface HeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string;
  jsonLdOrganization?: JsonLdOrganization;
  jsonLdWebPage?: boolean;
  noIndex?: boolean;
  twitterHandle?: string;
}

export function Head({
  title = 'Axis - Financial Advisor Career Insights & Compensation Analysis',
  description = 'Compare financial advisor transition packages, calculate your market value, and discover growth opportunities in the wealth management industry.',
  canonicalUrl,
  ogImage = '/images/advisor-offers-og.jpg',
  ogType = 'website',
  keywords = 'financial advisor, recruiting, transition package, advisor compensation, wirehouse, independent, RIA, advisor value calculator',
  jsonLdOrganization,
  jsonLdWebPage = false,
  noIndex = false,
  twitterHandle = '',
}: HeadProps) {
  const siteUrl = 'https://advisoroffers.com'; // Keep the domain same for now
  const fullUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl;
  const fullTitle = title.includes('Axis') ? title : `${title} | Axis`;
  
  // Default organization structured data if not provided
  const defaultOrganization: JsonLdOrganization = {
    name: 'FA Axis',
    url: siteUrl,
    logo: `${siteUrl}/images/logo.png`,
    description: 'Financial advisor career insights, compensation analysis, and transition package evaluation.',
    sameAs: []
  };
  
  // Use provided org data or fall back to defaults
  const organization = jsonLdOrganization || defaultOrganization;
  
  // Create WebPage structured data
  const webPage: JsonLdWebPage = {
    title: fullTitle,
    description,
    url: fullUrl
  };
  
  // Build JSON-LD scripts
  const organizationScript = `{
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "${organization.name}",
    "url": "${organization.url}",
    ${organization.logo ? `"logo": "${organization.logo}",` : ''}
    ${organization.description ? `"description": "${organization.description}",` : ''}
    ${organization.sameAs && organization.sameAs.length ? `"sameAs": ${JSON.stringify(organization.sameAs)}` : ''}
  }`;
  
  const webPageScript = `{
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "${webPage.title}",
    "description": "${webPage.description}",
    "url": "${webPage.url}"
  }`;
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Indexing Control */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`} />
      <meta property="og:site_name" content="FA Axis" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`} />
      {twitterHandle && <meta property="twitter:site" content={twitterHandle.startsWith('@') ? twitterHandle : `@${twitterHandle}`} />}
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">{organizationScript}</script>
      {jsonLdWebPage && <script type="application/ld+json">{webPageScript}</script>}
    </Helmet>
  );
}