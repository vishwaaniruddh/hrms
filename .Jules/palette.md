## 2024-05-24 - Missing ARIA labels on Icon Buttons
**Learning:** The application extensively uses `btn-icon` utility classes with inner `<em className="icon">` elements for actions (e.g., search toggles, back buttons, submit buttons) but systematically lacks `aria-label` attributes, creating a significant accessibility barrier for screen reader users.
**Action:** Whenever introducing or modifying icon-only buttons (`btn-icon`), always explicitly add descriptive `aria-label` attributes to ensure screen reader accessibility.
