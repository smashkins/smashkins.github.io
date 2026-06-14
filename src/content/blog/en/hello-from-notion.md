---
title: Hello from Notion
excerpt: The first post written in Notion and published to monoidx.dev by the automated sync — covering how the pipeline works end to end.
publishDate: 2026-06-13
tags:
  - engineering
  - monoidx
lang: en
notionId: 37da9c08-e476-81f1-bbd5-dda000b09f01
---

This post was written in **Notion** and landed on the site without touching git. It exists to exercise every feature the sync pipeline has to handle.


## How the pipeline works


An hourly GitHub Action queries this database for rows with _Published_ ticked, converts each page to Markdown, and commits the result to the repository.


### What gets mapped

- The **Name** becomes the post title
- The **Slug** decides the URL: `/blog/hello-from-notion/`
- **Tags** become filterable chips on the site

## A code block


```javascript
const posts = await notion.dataSources.query({
  data_source_id: process.env.NOTION_DATA_SOURCE_ID,
  filter: { property: 'Published', checkbox: { equals: true } },
});
```

> Notion is the source of truth: untick Published and the post disappears from the site on the next sync.

More details in the [first post](https://monoidx.dev/blog/building-monoidx/) about how this blog was built.


<figure><img src="/assets/blog/hello-from-notion/8f44f1ac1181.jpg" alt="The MONOIDX unit" /><figcaption>The MONOIDX unit</figcaption></figure>
