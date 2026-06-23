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
  nav: { home: string; blog: string; contact: string };
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
    comments: string;
    /** Ordered milestone phrases for the reading meter; last entry = 100%. */
    progress: string[];
  };
  search: {
    label: string;
    placeholder: string;
    noResults: string;
  };
};

export const ui: Record<Locale, UIStrings> = {
  en: {
    nav: { home: 'Home', blog: 'Articles', contact: 'Contact' },
    blog: {
      eyebrow: 'Dispatch Unit · Articles',
      title: 'Articles',
      subtitle: 'Field notes on Apple platforms, Swift, AI and everything else.',
      backToBlog: 'Back to articles',
      backToHome: 'Back to home',
      minRead: 'min read',
      contents: 'Contents',
      relatedPosts: 'Related posts',
      taggedWith: 'Tagged with',
      prev: 'Previous',
      next: 'Next',
      page: 'Page',
      updated: 'Updated',
      noTranslation: 'No translation available — opening the articles index instead.',
      toTop: 'Back to top',
      comments: 'Comments',
      progress: [
        'Just started',
        'Settling in',
        'Warming up',
        'Keep going',
        'Past halfway',
        'Picking up',
        'Almost there',
        'Nearly done',
        'Finished',
      ],
    },
    search: {
      label: 'Search articles',
      placeholder: 'Search posts, tags…',
      noResults: 'No posts match',
    },
  },
  it: {
    nav: { home: 'Home', blog: 'Articoli', contact: 'Contatto' },
    blog: {
      eyebrow: 'Dispatch Unit · Articoli',
      title: 'Articoli',
      subtitle: 'Appunti su piattaforme Apple, Swift, AI e tutto il resto.',
      backToBlog: 'Torna agli articoli',
      backToHome: 'Torna alla home',
      minRead: 'min di lettura',
      contents: 'Indice',
      relatedPosts: 'Articoli correlati',
      taggedWith: 'Etichettato con',
      prev: 'Precedente',
      next: 'Successivo',
      page: 'Pagina',
      updated: 'Aggiornato',
      noTranslation: 'Nessuna traduzione disponibile — apro invece l’indice degli articoli.',
      toTop: 'Torna su',
      comments: 'Commenti',
      progress: [
        'Appena iniziato',
        'Ci si avvia',
        'Si scalda',
        'Continua',
        'Oltre metà',
        'Si accelera',
        'Ci siamo quasi',
        'Quasi finito',
        'Finito',
      ],
    },
    search: {
      label: 'Cerca tra gli articoli',
      placeholder: 'Cerca articoli, tag…',
      noResults: 'Nessun articolo corrisponde a',
    },
  },
};
