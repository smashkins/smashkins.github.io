// Site-wide UI strings for the MONOIDX blog. English keys are the source of
// truth — add new strings to `en` first, then translate to `it`.

export const LOCALES = ['en', 'it'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const localeName: Record<Locale, string> = {
  en: 'English',
  it: 'Italiano',
};

type UIStrings = {
  nav: { home: string; blog: string; classic: string; contact: string };
  blog: {
    eyebrow: string;
    title: string;
    subtitle: string;
    backToBlog: string;
    backToHome: string;
    minRead: string;
    contents: string;
    relatedPosts: string;
    taggedWith: string;
    prev: string;
    next: string;
    page: string;
    updated: string;
    noTranslation: string;
    toTop: string;
  };
};

export const ui: Record<Locale, UIStrings> = {
  en: {
    nav: { home: 'Home', blog: 'Blog', classic: 'Classic', contact: 'Contact' },
    blog: {
      eyebrow: 'Dispatch · Blog',
      title: 'Blog',
      subtitle: 'Field notes on Apple platforms, Swift, and building MONOIDX.',
      backToBlog: 'Back to blog',
      backToHome: 'Back to home',
      minRead: 'min read',
      contents: 'Contents',
      relatedPosts: 'Related posts',
      taggedWith: 'Tagged with',
      prev: 'Previous',
      next: 'Next',
      page: 'Page',
      updated: 'Updated',
      noTranslation: 'No translation available — opening the blog index instead.',
      toTop: 'Back to top',
    },
  },
  it: {
    nav: { home: 'Home', blog: 'Blog', classic: 'Classic', contact: 'Contatto' },
    blog: {
      eyebrow: 'Dispaccio · Blog',
      title: 'Blog',
      subtitle: 'Appunti su piattaforme Apple, Swift e la costruzione di MONOIDX.',
      backToBlog: 'Torna al blog',
      backToHome: 'Torna alla home',
      minRead: 'min di lettura',
      contents: 'Indice',
      relatedPosts: 'Articoli correlati',
      taggedWith: 'Etichettato con',
      prev: 'Precedente',
      next: 'Successivo',
      page: 'Pagina',
      updated: 'Aggiornato',
      noTranslation: 'Nessuna traduzione disponibile — apro invece l’indice del blog.',
      toTop: 'Torna su',
    },
  },
};
