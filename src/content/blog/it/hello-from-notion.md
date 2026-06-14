---
title: Ciao da Notion
excerpt: Il primo articolo scritto in Notion e pubblicato su monoidx.dev dalla sincronizzazione automatica — come funziona la pipeline da un capo all'altro.
publishDate: 2026-06-13
tags:
  - engineering
  - monoidx
lang: it
notionId: 37da9c08-e476-812e-a267-d723dc7f0ef0
---

Questo articolo è stato scritto in **Notion** ed è arrivato sul sito senza toccare git. Esiste per mettere alla prova ogni funzionalità che la pipeline di sincronizzazione deve gestire.


## Come funziona la pipeline


Una GitHub Action oraria interroga questo database cercando le righe con _Published_ spuntato, converte ogni pagina in Markdown e committa il risultato nel repository.


### Cosa viene mappato

- Il **Name** diventa il titolo dell'articolo
- Lo **Slug** decide l'URL: `/it/blog/hello-from-notion/`
- I **Tags** diventano chip filtrabili sul sito

## Un blocco di codice


```javascript
const posts = await notion.dataSources.query({
  data_source_id: process.env.NOTION_DATA_SOURCE_ID,
  filter: { property: 'Published', checkbox: { equals: true } },
});
```

> Notion è la fonte di verità: togli la spunta a Published e l'articolo sparisce dal sito alla sincronizzazione successiva.

Altri dettagli nel [primo articolo](https://monoidx.dev/it/blog/building-monoidx/) su come è stato costruito questo blog.


<figure><img src="/assets/blog/hello-from-notion/8f44f1ac1181.jpg" alt="L'unità MONOIDX" /><figcaption>L'unità MONOIDX</figcaption></figure>
