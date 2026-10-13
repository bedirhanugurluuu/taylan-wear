import {useEffect, useRef} from 'react';

export type JudgemeConfig = {
  shopDomain: string;
  publicToken: string;
  cdnHost: string;
  delay?: number;
};

declare global {
  interface Window {
    jdgm?: {
      SHOP_DOMAIN?: string;
      PLATFORM?: string;
      PUBLIC_TOKEN?: string;
    };
  }
}

/**
 * Loads Judge.me widget CSS only.
 * Widget HTML is server-rendered; CDN widget JS/cache causes hydration
 * mismatches and cache.judge.me 404 noise on headless storefronts.
 */
export function JudgemeScripts({config}: {config: JudgemeConfig | null}) {
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!config?.shopDomain || !config.publicToken || !config.cdnHost) return;
    if (loadedRef.current || typeof document === 'undefined') return;
    loadedRef.current = true;

    window.jdgm = {
      ...(window.jdgm || {}),
      SHOP_DOMAIN: config.shopDomain,
      PLATFORM: 'shopify',
      PUBLIC_TOKEN: config.publicToken,
    };

    const cssId = 'judgeme-widget-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = `${config.cdnHost}/shopify_v2.css`;
      document.head.appendChild(link);
    }
  }, [config]);

  return null;
}
