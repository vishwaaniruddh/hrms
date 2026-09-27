## 2024-05-24 - Accessibility on Icon-Only Buttons
**Learning:** Dialog close buttons across the application were missing `aria-label` attributes, making them inaccessible to screen readers.
**Action:** Added `aria-label="Close modal"` to all elements with the `dialog-close-btn` class to ensure screen reader compatibility.
