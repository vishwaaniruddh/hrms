## 2024-05-13 - Missing ARIA Labels on Search Components
**Learning:** Icon-only buttons and search inputs frequently lack proper ARIA labels across the codebase (specifically in search/filter components like Member.jsx, Salary.jsx, Attendence.jsx), hindering screen reader navigation.
**Action:** When adding or modifying search inputs or icon-only toggle buttons, always include descriptive `aria-label` attributes to ensure keyboard and screen reader accessibility.
