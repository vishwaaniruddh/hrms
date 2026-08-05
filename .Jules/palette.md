## 2024-08-05 - Added ARIA labels to icon-only buttons
**Learning:** Found a recurring pattern in the HRMS components (like `Member.jsx` and `Salary.jsx`) where icon-only buttons (`.btn-icon`) lack `aria-label` attributes, which makes them inaccessible to screen readers.
**Action:** Always check for missing `aria-label` on buttons or links using `.btn-icon` classes when modifying these components.
