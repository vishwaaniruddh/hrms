## 2026-05-27 - Adding ARIA labels to global navigation
**Learning:** The application's main header component frequently uses nested dropdowns and icon-only trigger links (e.g., using `.nk-quick-nav-icon` and `em` tags) that lack accessible names, making the global navigation opaque to screen readers.
**Action:** When working on navigation or layout components, routinely check icon-only elements (like toggles and dropdown triggers) and add descriptive `aria-label` attributes to ensure screen reader compatibility without altering the visual design.
