## 2026-06-28 - Missing ARIA labels on custom UI elements
**Learning:** The application's custom UI patterns frequently use icon-only buttons (e.g., leveraging the `.btn-icon`, `.nk-quick-nav-icon`, `.nk-nav-toggle`, and `.dropdown-toggle` classes) that natively lack accessibility context.
**Action:** Regularly scan for and add `aria-label` attributes to these elements when implementing UX improvements.
