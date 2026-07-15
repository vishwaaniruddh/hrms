## 2024-05-24 - Missing ARIA Labels on Icon Buttons
**Learning:** The hrms codebase components (like Member.jsx) frequently use icon-only buttons via the '.btn-icon' class but omit the 'aria-label' attribute, creating a recurring accessibility barrier for screen readers.
**Action:** Always verify '.btn-icon' components and inject descriptive 'aria-label' attributes to ensure full keyboard and screen reader accessibility.
