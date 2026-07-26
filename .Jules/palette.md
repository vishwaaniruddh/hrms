## 2024-05-24 - Missing ARIA Labels on Icon Buttons
**Learning:** Many icon-only buttons (`.btn-icon`) in this application lack `aria-label` attributes, making them inaccessible to screen reader users who cannot deduce the button's purpose without visual context.
**Action:** Always verify `.btn-icon` classes and append appropriate `aria-label` tags to icon-only buttons to ensure keyboard and screen-reader accessibility.
