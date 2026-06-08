## 2024-05-18 - Missing ARIA Labels on Icon-only Buttons
**Learning:** The application's custom UI patterns frequently use icon-only buttons (e.g., leveraging the `.btn-icon`, `.nk-quick-nav-icon`, `.nk-nav-toggle`, and `.dropdown-toggle` classes) that natively lack accessibility context. These are pervasive across components like `Member.jsx`.
**Action:** When implementing UX improvements, regularly scan for and add `aria-label` attributes to these elements, prioritizing those with interactive roles like adding, searching, or toggling.
