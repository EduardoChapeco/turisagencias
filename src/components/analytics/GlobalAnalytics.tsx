import { useEffect } from 'react';

// Global types for TypeScript to stop complaining about window.fbq and window.gtag
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
    gtag: any;
    dataLayer: any;
  }
}

export interface GlobalAnalyticsProps {
  facebookPixelId?: string;
  googleAnalyticsId?: string;
  gtmId?: string;
}

export function GlobalAnalytics({ facebookPixelId, googleAnalyticsId, gtmId }: GlobalAnalyticsProps) {
  useEffect(() => {
    // 1. Meta Pixel
    if (facebookPixelId) {
      if (!window.fbq) {
        !function(f: any,b: any,e: any,v: any,n: any,t: any,s: any)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        
        window.fbq('init', facebookPixelId);
      }
      window.fbq('track', 'PageView');
    }
  }, [facebookPixelId]);

  useEffect(() => {
    // 2. Google Analytics 4
    if (googleAnalyticsId) {
      if (!window.gtag) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        window.gtag = function(){ window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('config', googleAnalyticsId);
      }
    }
  }, [googleAnalyticsId]);

  useEffect(() => {
    // 3. Google Tag Manager (if provided)
    if (gtmId && !document.getElementById('gtm-script')) {
      const script = document.createElement('script');
      script.id = 'gtm-script';
      script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${gtmId}');`;
      document.head.appendChild(script);
    }
  }, [gtmId]);

  return null; // This component does not render any UI
}
