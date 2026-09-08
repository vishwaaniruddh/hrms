## 2024-09-08 - Missing ARIA Labels Pattern in HRMS Module
**Learning:** The HRMS module consistently uses icon-only anchor tags and buttons (like `btn-icon`) for search toggles and dropdowns without accessible names, creating a barrier for screen reader navigation across multiple files.
**Action:** When working on HRMS components, always verify icon-only interactive elements have proper `aria-label` attributes to ensure keyboard and screen reader accessibility.
