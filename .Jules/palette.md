## 2024-08-04 - Icon-only buttons accessibility pattern
**Learning:** The codebase extensively uses `.btn-icon` classes in components like `Member.jsx` without providing `aria-label` attributes, creating a significant accessibility barrier for screen reader users relying on these interactive elements.
**Action:** Always proactively search for `.btn-icon` instances in this app's components and ensure they have descriptive `aria-label` attributes for accessibility.
