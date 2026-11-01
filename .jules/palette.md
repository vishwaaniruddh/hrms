## 2024-11-01 - Missing ARIA labels on Icon-only Buttons
**Learning:** Found a widespread pattern across many components (dialogs and sidebars) where icon-only buttons (`dialog-close-btn` and `sidebar-search-btn`) were missing `aria-label` attributes, creating a pervasive accessibility issue for screen reader users.
**Action:** Next time, prioritize scanning for custom button classes that typically contain only icons (e.g., close buttons, search toggles) and ensure they have descriptive `aria-label`s.
