## 2026-07-03 - Adding aria-labels to icon-only buttons in Header navigation
**Learning:** The application's core navigation relies heavily on icon-only buttons (e.g., messages, notifications, region selector, language selector) using `nk-quick-nav-icon` classes. These natively lack context for screen readers.
**Action:** Identify and append `aria-label` attributes to these frequently accessed navigational `<a>` elements to improve accessibility without changing visual design.
