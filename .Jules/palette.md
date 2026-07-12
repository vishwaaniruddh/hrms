## 2026-07-12 - Missing ARIA Labels on Icon Buttons
**Learning:** The codebase, specifically within `src/components/hrms/` (e.g., `Member.jsx`, `Salary.jsx`, `Attendence.jsx`), frequently uses the `.btn-icon` class for icon-only buttons that lack required `aria-label` attributes, representing a recurring accessibility deficit.
**Action:** When adding or modifying `.btn-icon` elements, always ensure an appropriate `aria-label` is included to support screen readers and keyboard navigation.
