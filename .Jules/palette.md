## 2024-05-18 - Missing ARIA labels in custom icon buttons
**Learning:** This application heavily relies on custom icon-only UI patterns using `<a>` and `<button>` elements with `btn-icon`, `search-toggle`, `dropdown-toggle` classes. These natively lack accessibility context and often lack `aria-label` attributes.
**Action:** When implementing UX improvements or creating new components that use these icon-only button patterns, consistently ensure that `aria-label` attributes are included for screen readers.
