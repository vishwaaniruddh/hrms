## 2024-05-18 - Missing ARIA Labels in Icon-Only Buttons
**Learning:** The application extensively uses `.btn-icon` classes for icon-only buttons (like search and toggle buttons) without native accessibility context (ARIA labels), causing them to be unintelligible to screen readers.
**Action:** Regularly scan for and append `aria-label` attributes to `.btn-icon` elements to ensure full accessibility.
