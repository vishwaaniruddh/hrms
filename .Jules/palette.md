## 2024-05-24 - Accessibility improvements for custom icon buttons
**Learning:** The application heavily relies on custom anchor tags styled as icon-only buttons (`btn-icon`, `nk-quick-nav-icon`, etc.) which native lack semantic meaning and aria labels, making them inaccessible to screen readers.
**Action:** I will add `aria-label` attributes to these custom icon buttons across the application.
