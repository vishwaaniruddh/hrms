## 2026-06-25 - Adding aria-labels to icon-only buttons
**Learning:** The application's custom UI patterns frequently use icon-only buttons (e.g., leveraging the `.btn-icon` class) that natively lack accessibility context; these elements require explicit `aria-label` attributes to be usable by screen readers.
**Action:** Always scan for and add `aria-label` attributes to `.btn-icon` elements, especially `dropdown-toggle` and search triggers, when implementing UX improvements.
