## 2024-09-10 - Missing ARIA Labels on Action Dropdowns
**Learning:** The "More options" (`ni-more-h`) icon-only dropdown action buttons across main HRMS tables (Attendence, Member, Salary) consistently lack explicit ARIA labels, making these critical actions completely invisible to screen readers.
**Action:** Always verify that elements using `btn-icon` classes also possess an `aria-label` attribute describing their function when reviewing or modifying table row actions.
