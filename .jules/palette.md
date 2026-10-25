## 2024-05-20 - Missing ARIA Labels on Icon-only Close Buttons
**Learning:** Found a recurring pattern in the design system where modal/dialog close buttons (`.dialog-close-btn`) contain only an icon (`<X size={16} />`) without any accessible text, rendering them invisible or confusing to screen readers.
**Action:** When implementing or fixing icon-only buttons, always ensure an `aria-label` or visually hidden text is provided to guarantee keyboard/screen reader accessibility.
