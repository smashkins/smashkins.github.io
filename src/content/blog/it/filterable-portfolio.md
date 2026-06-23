---
title: Costruire un Portfolio Filtrabile per la Landing MONOIDX
excerpt: Un portfolio guidato dai dati con filtro per tipo e paginazione, un HUD del curriculum che ci si collega — e due bug legati allo scroll (una cancellazione dello scroll con il pinning e una collisione di funzioni in uno script classico) più istruttivi delle funzionalità stesse.
publishDate: 2026-06-23
tags:
  - astro
  - engineering
  - monoidx
image: /assets/blog/filterable-portfolio/2e1ca1a5eef9.jpg
lang: it
notionId: 388a9c08-e476-81b6-85e2-ddaf825ed9e0
---

La landing di MONOIDX ha appena ricevuto il suo aggiornamento di contenuti più grande dalla migrazione ad Astro: una vera sezione **Portfolio**, un **HUD del curriculum** che si legge come un CV, e il tessuto connettivo tra i due. Niente è scritto a mano nel codice ma  tutto è guidato da due file Markdown. Questo articolo racconta cosa è stato rilasciato, il modello dati dietro le quinte e due bug che si sono rivelati più interessanti delle funzionalità stesse.


(Lo stesso commit ha anche ritirato la vecchia pagina "classica" `MONOIDX.html` e ogni riferimento ad essa, ora la build Astro è l'unica landing.)


## Un portfolio che modifichi in Markdown


La sezione Portfolio ("Selected Work") e il pannello di dettaglio di ogni progetto sono generati da un singolo file, `src/data/portfolio.md` frontmatter YAML, lo stesso schema già usato dal curriculum. L'ordine dei `projects` nel file è l'ordine sulla pagina. Ogni progetto è una card; cliccandola si apre un **HUD di dettaglio** centrato e traslucido con piattaforma, titolo, data, descrizione, righe di specifiche, immagini/video e link.


```yaml
projects:
  - slug: "project-eolo"
    context: "employed"
    platform: "iOS · UIKit/SwiftUI"
    title: "Project: Eolo"
    date: "2023"
    summary: "Short description shown on the card."
    description: "Longer write-up shown in the HUD."
    specs:
      - label: "Stack"
        value: "Swift · SPM · XCFramework"
    links:
      - label: "Documentation"
        href: "https://example.com"
```


Lo `slug` lega tre cose insieme: la card nella griglia, il pannello modale (`data-project="slug"`) e la cartella delle immagini sotto `public/assets/portfolio/<slug>/`. Per aggiungere un progetto basta aggiungere una voce; non serve toccare altro.


## Filtrare per tipo di progetto


Ho quattro tipi di lavoro, progetti da dipendente, lavoro freelance per clienti, prodotti indie ed esperimenti, ma non formano una lista pulita. "Sperimentale" attraversa gli altri: un prototipo di R&D può essere realizzato presso un datore di lavoro _oppure_ per un cliente freelance. Un singolo enum `type` costringerebbe ogni progetto in un'unica casella, mentendo sulla sovrapposizione.


Quindi il modello ha **due assi ortogonali**:

- `context`: uno tra `employed`, `freelance`, `indie` - ogni progetto ne ha esattamente uno.
- `experimental: true` - un flag opzionale e trasversale.

Le pill del filtro sono derivate dai dati a build time, così una pill appare solo se ha dei progetti dietro:


```javascript
const PF_CONTEXT_ORDER = ['employed', 'freelance', 'indie'];
const pfContexts = PF_CONTEXT_ORDER.filter(c => pfProjects.some(p => p.context === c));
const pfHasExperimental = pfProjects.some(p => p.experimental);
```


Le pill sono a selezione singola (All / Employed / Freelance / Indie / Experimental) e la regola di match legge direttamente i data attribute della card:


```javascript
const matches = (card) =>
  filter === "all"          ? true :
  filter === "experimental" ? card.dataset.experimental === "true" :
                              card.dataset.context === filter;
```


Scegliendo _Experimental_ si vedono tutti gli esperimenti a prescindere dal contesto; scegliendo _Freelance_ si vede il lavoro freelance inclusi gli esperimenti fatti lì. È il comportamento onesto che il modello a due assi permette.


## Una paginazione che collabora col filtro


Sei progetti per pagina. La complicazione: il filtro cambia l'insieme visibile, quindi il numero di pagine è dinamico. Una sola funzione possiede l'intera pipeline - **filtra → ricalcola le pagine → mostra la fetta corrente → ricostruisce il pager** - e viene rieseguita a ogni click su una pill o una freccia:


```javascript
function pfRender(){
  const shown = cards.filter(matches);
  const pageCount = Math.max(1, Math.ceil(shown.length / SIZE));
  if (page > pageCount) page = pageCount;
  const onPage = new Set(shown.slice((page - 1) * SIZE, page * SIZE));

  cards.forEach(card => {
    const on = onPage.has(card);
    card.hidden = !on;
    if (on) gsap.set(card, { autoAlpha: 1, y: 0 });  // un-strand from the entrance state
  });
  // ricostruisce i pulsanti numerati, mostra/nasconde il pager, disabilita le frecce ai limiti…
}
```


Quel `gsap.set` è importante. Le card entrano in scena con un tween GSAP `from()` (autoAlpha 0 → 1) quando entrano nel viewport. Una card rivelata dalla paginazione o dal filtro non attraversa mai quel trigger di scroll, quindi senza forzarne la visibilità resterebbe bloccata a opacità 0. (Io e GSAP non avevamo ancora finito di litigare - vedi sotto.)


Qui viveva anche una piccola insidia CSS: il pager portava l'attributo `hidden` quando c'era una sola pagina, ma `.pf-pager { display:flex }` sovrascriveva il `display:none` dell'attributo. Il pager vuoto - solo le frecce - restava a schermo. Fix: `.pf-pager[hidden]{ display:none }`.


## Collegare una nota del curriculum a un progetto


L'HUD del curriculum elenca le esperienze, ognuna con note puntate. Una nota può fare deep-link a un progetto del portfolio con un token inline, in stile link Markdown:


```yaml
notes:
  - "More technical details are [here](project:project-one)"
```


A build time un piccolo parser divide ogni nota su `[label](project:slug)` e renderizza il segmento corrispondente come un pulsante che porta `data-project-link="slug"`; un click handler delegato apre l'HUD di quel progetto _sopra_ il drawer aperto (il modale sta a uno z-index più alto). Gli slug che non si risolvono ricadono su testo semplice, così un refuso degrada con grazia invece di produrre un link morto.


## Contenuti del curriculum, ristrutturati


Piccoli cambiamenti che insieme fanno un vero CV:

- Le esperienze accettano una lista `notes:` (resa a punti) oppure una singola stringa `note:`.
- Ogni riga meta può portare un `note:` opzionale, reso in piccolo e allineato a sinistra sotto il valore.
- "Core Skills" è raggruppato per categoria (Languages, iOS Frameworks, Architecture, Tooling & CI/CD) e reso come lista separata da punti per gruppo.
- Un blocco `metaAfter:` permette a righe specifiche (es. "Status") di stare _dopo_ il blocco delle skill invece che sopra.

## Bug uno: la navigazione che non scrollava


Con tutto questo a posto, la navigazione si è rotta. Cliccando **Expertise** nella rail, o il link **Portfolio**, lo scroll avanzava di qualche centinaio di pixel e si fermava - lontanissimo dalla destinazione. Ogni link dentro o oltre la sequenza pinnata di apertura finiva più o meno nello stesso punto.


La landing pinna un elemento `#stage` per tutta la sequenza di apertura con GSAP ScrollTrigger. La causa radice:


> ⚠️ Lo `scrollTo({ behavior: "smooth" })` nativo viene **annullato silenziosamente dopo poche centinaia di pixel** quando ScrollTrigger sta pinnando - l'animazione smooth del browser e il pin si scontrano, e lo scroll muore a metà corsa. Il globale `html { scroll-behavior: smooth }` peggiorava le cose ri-smussando ogni scroll programmatico.


La soluzione è smettere di usare lo smooth scroll del browser e guidare la posizione di scroll io stesso sul ticker di GSAP, con cui ScrollTrigger collabora:


```javascript
function smoothScrollTo(y){
  const max = document.documentElement.scrollHeight - window.innerHeight;
  y = Math.max(0, Math.min(Math.round(y), max));
  if (reduce){ window.scrollTo({ top: y }); return; }
  const o = { y: window.scrollY };
  gsap.to(o, {
    y, duration: 0.9, ease: "power2.inOut",
    onUpdate(){ window.scrollTo({ top: o.y, behavior: "auto" }); },
  });
}
```


Due dettagli di supporto. Primo, disabilitare lo smooth scroll CSS solo sulla landing così non può ri-smussare ogni frame: `html:has(body.scroll-edition){ scroll-behavior:auto }`. Secondo, esporre questo scroller su `window` così il pulsante condiviso "back to top" lo preferisce sulla landing, mentre le pagine del blog - che non hanno pin - mantengono il normale smooth scroll nativo.


## Bug due: il pannello del curriculum che moriva in silenzio


Poi il drawer del curriculum ha smesso di aprirsi. Nessun errore in console, nessun movimento - ogni trigger (il pulsante, la manopola dello slider, il deep link `#resume`) morto. GSAP in sé era a posto; un tween di prova ticchettava fino al completamento. Il pannello semplicemente non si muoveva.


Il colpevole era una collisione di nomi. `scroll.js` è caricato come script **classico** (non-module), perché passa i globali di GSAP attraverso i tag `<script>`:


```html
<script is:inline src="/scroll.js"></script>
```


In uno script classico in sloppy-mode, una dichiarazione di `function` dentro un blocco viene hoistata allo scope della funzione contenitore. Il mio nuovo codice di paginazione definiva una `function render(){…}` dentro il suo blocco `if (pfGrid) { … }` - lo **stesso nome** della `render()` globale del pannello curriculum. Quando il blocco di paginazione veniva eseguito all'avvio, la sua `render` sovrascriveva quella globale. Da quel momento, ogni chiamata a `render()` nella logica del pannello - inclusa quella dentro `snapTo()` - eseguiva il _filtro del portfolio_ invece di riposizionare il drawer.


> 🩹 La correzione è stata un singolo rename: la funzione di paginazione è diventata `pfRender()`. Uno script `type="module"` avrebbe dato scope di blocco alla dichiarazione e avrebbe fatto emergere subito lo shadowing - ma questo file è volutamente classico, quindi la disciplina è semplice: mantenere unici i nomi delle funzioni top-level e di blocco.


## Conclusioni

- **Il contenuto è dato.** Il layout è fisso; il frontmatter Markdown è l'API. Aggiungere un progetto o un'esperienza è una modifica, non il deploy di nuovo codice.
- **Modella il dominio con onestà.** Due assi ortogonali (`context` + `experimental`) battono un enum approssimativo nel momento in cui un progetto appartiene a più di una categoria.
- **Quando una libreria possiede lo scroll, lasciale possedere anche lo scroll programmatico.** Pinning e smooth scroll nativo non vanno d'accordo; guida la posizione sul ticker della libreria.
- **Conosci le regole di scope del tuo script.** In uno script classico, un nome di `function` di blocco vagante è un globale - e sovrascriverà allegramente un altro senza alcun avviso.
