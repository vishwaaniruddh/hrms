## 2024-03-24 - Accessibility improvements for icon-only buttons
**Learning:** Dialog close buttons and icon-only interaction buttons lacked aria-labels, impacting screen reader usability across the app.
**Action:** Always ensure any `<button>` containing only an icon (like Lucide React icons) includes a descriptive `aria-label` or uses a visually hidden text fallback.
