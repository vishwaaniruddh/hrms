## 2026-06-20 - [Missing ARIA labels on custom icon buttons]
**Learning:** The application's design system frequently uses icon-only buttons leveraging custom classes like `.nk-quick-nav-icon`, `.btn-icon`, `.nk-nav-toggle`, and `.dropdown-toggle` which natively lack accessibility context.
**Action:** Regularly scan for and add `aria-label` attributes to these custom icon button classes to ensure proper screen reader compatibility.
