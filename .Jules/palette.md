## 2026-07-31 - Missing aria-labels on icon-only buttons
**Learning:** The codebase (particularly HRMS components like MemberProfile) frequently uses `.btn-icon` classes for icon-only buttons that lack required `aria-label` attributes, making them inaccessible to screen readers.
**Action:** When working on UI components, always ensure that `.btn-icon` elements have an appropriate `aria-label` added if they don't have text content.
