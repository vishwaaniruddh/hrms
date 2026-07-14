## 2026-07-14 - Missing ARIA Labels on Icon Buttons
**Learning:** The application extensively uses the `.btn-icon` class for icon-only buttons without corresponding `aria-label` attributes, leading to a pervasive accessibility deficit across components.
**Action:** When working on components or reviewing code containing `.btn-icon`, always verify and add an appropriate `aria-label` to ensure screen reader compatibility.
