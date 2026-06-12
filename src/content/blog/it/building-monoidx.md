---
title: Costruire la Landing e il Blog di MONOIDX
excerpt: Come il sito MONOIDX è passato da una singola pagina HTML scroll-driven a un progetto Astro essenziale con un blog bilingue — senza perdere la sequenza canvas né il linguaggio visivo.
publishDate: 2026-06-12
tags: [astro, engineering, monoidx]
lang: it
---

La landing di MONOIDX è nata come un unico file: una pagina scroll-driven che scorre una sequenza canvas di sessanta fotogrammi man mano che si scende nel documento. Funzionava, ma era un vicolo cieco. Aggiungere un blog, una seconda lingua o una SEO adeguata significava o incollare per sempre HTML scritto a mano su una pagina statica, oppure passare a un build capace di generare le rotte al posto mio. Ho scelto la seconda strada, con un vincolo semplice: la landing doveva risultare identica nell'aspetto e nel comportamento.

## Mantenere intatta la sequenza scroll

La sequenza è il cuore della pagina, quindi è la parte che mi sono rifiutato di toccare. Il canvas è guidato da GSAP e ScrollTrigger caricati da una CDN, più uno `scroll.js` che legge variabili globali e dereferenzia all'avvio una lunga lista di id di elementi. Qualsiasi riordino degli script, o un id mancante, lo fa crollare prima che venga disegnato il primo fotogramma.

### La regola is:inline

Il dettaglio più importante del port su Astro è stato forzare i tre script a restare inline e in ordine — GSAP, poi ScrollTrigger, poi `scroll.js`. Astro tenderebbe volentieri a impacchettare e riordinare gli script come moduli, rompendo così il passaggio di consegne tra le variabili globali.

```js
// I fotogrammi sono indirizzati per stringa, mai importati — quindi
// devono stare in public/ e non essere mai rinominati dal bundler.
const FRAME = (i) => `/assets/frames/f${String(i).padStart(2, "0")}.jpg`;

ScrollTrigger.create({
  trigger: "#scrolly",
  scrub: true,
  onUpdate: (self) => {
    const i = Math.round(self.progress * 59);
    drawFrame(FRAME(i));
  },
});
```

Poiché i fotogrammi sono referenziati come semplici stringhe, devono restare in `public/` affinché il build non li rinomini. Quella sola regola ha mantenuto tutti e sessanta i fotogrammi raggiungibili dopo lo spostamento.

## Il port su Astro

Il markup del body è migrato in `src/pages/index.astro` quasi alla lettera, avvolto in un `BaseLayout` che replica l'`<head>` originale — i font, il foglio di stile root-relative e i meta SEO. L'unica modifica intenzionale al markup è stata la nav: i link ora puntano al blog e a una pagina classica di riserva.

> L'obiettivo non è mai stato ridisegnare. Era rendere generabile la pagina esistente, così che ogni novità potesse condividerne lo scheletro.

Ciò che Astro porta qui non è la landing — è tutto ciò che le sta attorno: collezioni di contenuti, paginazione, RSS, una sitemap e il routing per lingua, tutto generato in fase di build in un `dist/` completamente statico.

## Il blog e i design token

Il blog doveva risultare lo stesso prodotto della landing, quindi poggia interamente sui design token della landing:

- `--display` e `--mono` per l'accoppiata tipografica
- `--line` e `--line-2` per i bordi sottili
- `--ease` per ogni transizione
- gli idiomi `.eyebrow` e `.wrap` riusati alla lettera

Le righe degli articoli riprendono l'hover di `philo-row` della landing — un piccolo scostamento del padding al passaggio del mouse, un bordo sottile tra le righe, i metadati in monospazio a sinistra. I tag diventano chip sottili, l'indice diventa una colonna sticky sul desktop e un blocco `<details>` su mobile, e il tutto resta bilingue grazie a un piccolo [helper i18n](https://docs.astro.build/en/guides/internationalization/) che antepone `/it` alle rotte italiane.

Il risultato è un'unica codebase, un unico linguaggio visivo e un blog che sembra essere sempre stato parte dell'unità.
