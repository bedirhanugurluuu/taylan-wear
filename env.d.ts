/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

declare global {
  interface Env {
    JUDGEME_SHOP_DOMAIN?: string;
    JUDGEME_PUBLIC_TOKEN?: string;
    JUDGEME_PRIVATE_API_TOKEN?: string;
    JUDGEME_CDN_HOST?: string;
  }
}

declare module '@judgeme/shopify-hydrogen' {
  import type {ComponentType} from 'react';

  export type JudgemeConfig = {
    shopDomain: string;
    publicToken: string;
    cdnHost: string;
    delay?: number;
  };

  export function useJudgeme(config: JudgemeConfig): void;

  export const JudgemePreviewBadge: ComponentType<{id: string}>;
  export const JudgemeReviewWidget: ComponentType<{id: string}>;
  export const JudgemeVerifiedBadge: ComponentType<{id: string}>;
  export const JudgemeMedals: ComponentType;
  export const JudgemeCarousel: ComponentType;
  export const JudgemeReviewsTab: ComponentType;
  export const JudgemeAllReviewsCount: ComponentType;
  export const JudgemeAllReviewsRating: ComponentType;
}

export {};
