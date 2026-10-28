## 2024-05-24 - Add ARIA Labels to Dialog Close Buttons
**Learning:** Found a widespread accessibility issue across the app where modal dialog close buttons lacked `aria-label` attributes, making them unintelligible to screen readers as they typically just contained a visual `X` icon.
**Action:** Always ensure icon-only buttons, especially common ones like dialog close buttons, have an explicit `aria-label` providing context.
