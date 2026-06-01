## 2026-06-01 - Missing ARIA labels on custom global navigation buttons
**Learning:** Custom UI patterns in this design system (like `.nk-quick-nav-icon` and `.dropdown-toggle` used for icon-only buttons) natively lack accessibility context and screen reader descriptions.
**Action:** When implementing UX improvements or observing navigation links, proactively scan for icon-only buttons (especially those using the design system's specific navigation classes) and add descriptive `aria-label` attributes.
