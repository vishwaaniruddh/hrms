## 2025-02-18 - Missing ARIA Labels on Icon-Only Quick Navigations
**Learning:** The application's custom UI patterns frequently use icon-only buttons (e.g., leveraging the `nk-quick-nav-icon` and `nk-nav-toggle` classes) that natively lack accessibility context. These patterns are prevalent in core navigation components like `Header.jsx`.
**Action:** Regularly scan for and add `aria-label` attributes to elements using these icon-only classes when implementing UX improvements to ensure essential context for screen readers.
