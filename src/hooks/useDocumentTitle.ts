/** Sets `document.title` per route; restores the site default on unmount. */
import { useEffect } from 'react';
import { site } from '@/data/site';

const BASE_TITLE = `${site.displayName} — Security portfolio`;

export function useDocumentTitle(pageTitle: string) {
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} · ${site.displayName}` : BASE_TITLE;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [pageTitle]);
}
