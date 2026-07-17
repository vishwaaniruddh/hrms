## 2024-05-24 - Missing aria-labels on btn-icon components
**Learning:** The codebase, specifically within src/components/hrms/ (e.g., Member.jsx, Salary.jsx, Attendence.jsx), frequently uses the `.btn-icon` class for icon-only buttons that lack required `aria-label` attributes, representing a recurring accessibility deficit.
**Action:** Always check for missing `aria-label`s on elements with `.btn-icon` classes when reviewing or modifying HRMS components.
