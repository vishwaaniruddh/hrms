## 2024-07-18 - Missing ARIA Labels on Icon Buttons
**Learning:** The codebase, specifically within `src/components/hrms/` (e.g., `Member.jsx`, `Salary.jsx`, `Attendence.jsx`), frequently uses the `.btn-icon` class for icon-only buttons that lack required `aria-label` attributes.
**Action:** When working on components in this directory, always check `.btn-icon` buttons and add appropriate `aria-label` attributes to ensure they are accessible to screen readers.
