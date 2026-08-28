## 2024-10-24 - Missing ARIA Labels on btn-icon Utility
**Learning:** The HRMS module heavily relies on a `btn btn-icon` utility class pattern for icon-only actions (like search toggles, dropdown triggers, and mobile-only buttons), but these consistently lack `aria-label` attributes, making critical interactive elements opaque to screen readers.
**Action:** When working with the `btn-icon` utility pattern in this codebase, always ensure an `aria-label` is included since the base component structure does not enforce it.
