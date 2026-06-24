try {
  if (localStorage.getItem('monoidx-lang') === 'it') {
    const blogLink = document.querySelector<HTMLAnchorElement>('.nav-links a[href="/blog/"]');
    blogLink?.setAttribute('href', '/it/blog/');
  }
} catch {
  // Ignore unavailable storage, for example in strict privacy contexts.
}
