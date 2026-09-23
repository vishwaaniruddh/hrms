## 2024-05-24 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** A widespread accessibility issue pattern specific to this app's components is the use of `btn-icon` anchors and buttons that rely solely on `em` icons (like `ni ni-search`, `ni ni-more-h`) without `aria-label` attributes, making them inaccessible to screen readers.
**Action:** Always add descriptive `aria-label` attributes to `.btn-icon` elements that do not contain visible text to ensure keyboard and screen reader accessibility.
