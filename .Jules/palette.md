## 2026-05-14 - Missing ARIA labels on custom UI pattern icon buttons
**Learning:** The custom UI component patterns in this app extensively use icon-only buttons (like `.btn-icon`) for critical interactions such as toggling menus and submitting searches, but uniformly lack `aria-label` attributes.
**Action:** When implementing UX improvements, regularly scan for `.btn-icon` and similar utility classes to ensure screen reader context is provided for these interactive elements.
