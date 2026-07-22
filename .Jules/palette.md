## 2024-05-24 - Missing ARIA Labels on Icon Buttons
**Learning:** The codebase, specifically within `src/components/hrms/` (e.g., `Member.jsx`, `Salary.jsx`, `Attendence.jsx`), frequently uses the `.btn-icon` class for icon-only buttons that lack required `aria-label` attributes, representing a recurring accessibility deficit.
**Action:** Proactively scan for and add `aria-label` attributes to any `.btn-icon` elements when working on components to ensure screen reader accessibility.
