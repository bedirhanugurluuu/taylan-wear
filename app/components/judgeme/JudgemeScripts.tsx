import {useEffect, useRef} from 'react';
import {useLocation} from 'react-router';
import {useNonce} from '@shopify/hydrogen';

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
    jdgm_preloader?: () => void;
    jdgmCacheServer?: {reloadAll: () => void};
    jdgm_rerender?: number;
  }
}

/** Loads Judge.me CDN scripts once; re-renders widgets on client navigations. */
export function JudgemeScripts({config}: {config: JudgemeConfig | null}) {
  const nonce = useNonce();
  const location = useLocation();
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

    const boot = async () => {
      try {
        // widget_preloader lives on cdnwidget (cdn.judge.me redirects there)
        const preloaderHost = 'https://cdnwidget.judge.me';
        const preloaderRes = await fetch(
          `${preloaderHost}/widget_preloader.js`,
        );
        const preloaderText = await preloaderRes.text();

        if (!document.getElementById('judgeme-preloader')) {
          const preloaderScript = document.createElement('script');
          preloaderScript.id = 'judgeme-preloader';
          if (nonce) preloaderScript.setAttribute('nonce', nonce);
          preloaderScript.textContent = `window.jdgm_preloader = function jdgm_preloader(){${preloaderText}};`;
          document.head.appendChild(preloaderScript);
        }

        if (!document.getElementById('judgeme-installed')) {
          const script = document.createElement('script');
          script.id = 'judgeme-installed';
          script.src = `${config.cdnHost}/assets/installed.js`;
          if (nonce) script.setAttribute('nonce', nonce);
          document.head.appendChild(script);
        }
      } catch (error) {
        console.error('Judge.me script load failed', error);
      }
    };

    void boot();
  }, [config, nonce]);

  useEffect(() => {
    if (!config) return;

    const delay = config.delay ?? 500;
    window.clearTimeout(window.jdgm_rerender);
    window.jdgm_rerender = window.setTimeout(() => {
      if (window.jdgm_preloader && !window.jdgmCacheServer) {
        window.jdgm_preloader();
      } else if (window.jdgmCacheServer) {
        window.jdgmCacheServer.reloadAll();
      }
    }, delay);

    return () => window.clearTimeout(window.jdgm_rerender);
  }, [config, location.key]);

  return null;
}
