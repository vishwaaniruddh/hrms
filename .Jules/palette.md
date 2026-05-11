## 2024-05-18 - Icon-Only Button Accessibility
**Learning:** This app frequently relies on `<em>` tags with icon classes inside anchor tags (`<a>`) without any accessible names, causing navigation links to be invisible to screen readers.
**Action:** Always check icon-only navigation elements (especially in headers/sidebars) and append descriptive `aria-label` attributes to ensure they are screen-reader friendly without breaking the visual layout.
