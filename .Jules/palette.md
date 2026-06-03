## 2024-05-18 - Missing Accessibility Context on Custom Icon-only Buttons
**Learning:** The application uses custom icon-only links extensively (e.g., `.nk-quick-nav-icon`), which natively lack accessibility context for screen readers.
**Action:** Always add descriptive `aria-label` attributes to icon-only interactive elements to ensure accessibility.
