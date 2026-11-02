## 2025-03-01 - [ARIA Labels for Icon-Only Buttons]
**Learning:** Icon-only buttons used for actions such as View, Edit, and Delete lack `aria-label` attributes which reduces accessibility for screen readers. Using `title` attributes alone is insufficient. Adding `aria-label` to these components greatly improves accessibility and makes standard UI component usage better aligned with a11y principles.
**Action:** Consistently add descriptive `aria-label` properties to icon-only buttons like those in `src/components/hrms/Member.jsx` and similar modal close buttons.
