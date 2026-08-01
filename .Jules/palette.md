## 2024-08-01 - Missing aria-labels on icon-only buttons
**Learning:** The codebase, specifically within `src/components/hrms/` (e.g., `Salary.jsx`), frequently uses the `.btn-icon` class for icon-only buttons that lack required `aria-label` attributes, representing a recurring accessibility deficit.
**Action:** Always check `.btn-icon` elements for missing `aria-label` attributes and add them to improve screen reader accessibility.
