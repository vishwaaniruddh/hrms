## 2024-08-10 - Icon-Only Button Accessibility Pattern
**Learning:** The application heavily relies on a specific CSS class pattern (btn-icon with an embedded em.icon) for icon-only buttons (e.g., search toggles, add buttons). These elements consistently lack aria-label attributes, rendering them inaccessible to screen readers.
**Action:** When using or modifying the .btn-icon utility class in this codebase, always pair it with a descriptive aria-label attribute to ensure screen reader accessibility.
