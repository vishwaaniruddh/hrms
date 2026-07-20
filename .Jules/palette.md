## 2026-07-20 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** The application extensively uses `.btn-icon` classes across components (e.g., `Member.jsx`) for icon-only buttons (search toggles, dropdown menus, submit buttons) without providing descriptive `aria-label` attributes.
**Action:** Add `aria-label` attributes to all icon-only buttons utilizing the `.btn-icon` class to ensure screen reader compatibility and improve overall accessibility.
