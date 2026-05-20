## 2024-05-24 - Accessibility gaps in custom navigation UI
**Learning:** The application extensively uses custom UI patterns (`nk-quick-nav-icon`, `nk-nav-toggle`) for navigation and interactive actions that lack native accessibility context like `aria-label`.
**Action:** When implementing UX improvements, specifically target elements using these legacy classes to ensure they provide adequate context for screen readers.
