## 2024-05-18 - Header component uses native `.nk-quick-nav-icon` classes for icon-only anchor tags
**Learning:** The navigation header has several anchor tags styled with custom `.nk-quick-nav-icon` classes that act as buttons (menu toggle, region, chat, notification, language, user) but lack accessible text, rendering them invisible or confusing to screen readers.
**Action:** Always scan custom navigation headers that use utility classes for icon-only links and append descriptive `aria-label` attributes to ensure they are fully navigable by keyboard and screen reader users.
