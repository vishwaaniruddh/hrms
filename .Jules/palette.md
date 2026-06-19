## 2026-06-19 - Icon-only Buttons Missing Accessibility Context
**Learning:** The application's header uses several icon-only buttons (`.nk-quick-nav-icon`, `.nk-nav-toggle`) that entirely lack screen reader context, making navigation impossible for non-visual users.
**Action:** Consistently add descriptive `aria-label` attributes to all icon-only interactive elements to ensure they are accessible.
