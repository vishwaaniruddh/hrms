## 2025-05-12 - Icon-only navigation links accessibility
**Learning:** Adding an ARIA label to an icon-only quick-nav link significantly improves the accessibility and clarifies its function for screen reader users, as this pattern lacked explicit labeling context.
**Action:** Always add `aria-label` or `title` to elements, especially `<a>` and `<button>`, that use icons exclusively without accompanying text, to improve the general semantic quality.
