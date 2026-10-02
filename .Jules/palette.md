## 2024-05-24 - Accessibility: Missing ARIA labels on Icon-only Buttons
**Learning:** Found an accessibility issue pattern across this app's components, where icon-only buttons (like `btn-icon` or `dialog-close-btn`) frequently lack `aria-label` attributes.
**Action:** Always verify that `aria-label` is included when using an icon-only button inside React components to ensure screen-reader accessibility.
