## 2024-07-24 - Missing ARIA labels on icon-only buttons
**Learning:** The codebase, specifically within src/components/hrms/ (e.g., Member.jsx, Salary.jsx, Attendence.jsx), frequently uses the .btn-icon class for icon-only buttons that lack required aria-label attributes, representing a recurring accessibility deficit.
**Action:** Always add aria-label attributes to elements using the .btn-icon class to ensure screen reader accessibility.
