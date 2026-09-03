import Script from 'next/script';

/**
 * GA4.
 *
 * Renders nothing unless NEXT_PUBLIC_GA_ID is set, so development and preview
 * deployments never pollute the property. `afterInteractive` keeps it off the
 * critical path — analytics must not compete with LCP.
 *
 * IP anonymisation is on and ad personalisation signals are off: the site only
 * needs to know which pages work, not to build an advertising profile of the
 * visitor. That also keeps the privacy policy's claims true.
 */
export function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${id}', {
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false
          });
        `}
      </Script>
    </>
  );
}
