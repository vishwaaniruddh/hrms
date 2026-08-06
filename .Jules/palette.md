## 2024-05-15 - Missing ARIA Labels on Icon Buttons
**Learning:** The application frequently uses `.btn-icon` classes for icon-only buttons (especially in `src/components/hrms/` like `Member.jsx`, `Attendence.jsx`, `Salary.jsx`) without providing accessible names via `aria-label`, representing a systemic accessibility issue for screen reader users.
**Action:** Proactively search for `.btn-icon` elements during UI reviews and ensure they have descriptive `aria-label` attributes to maintain accessibility standards.
