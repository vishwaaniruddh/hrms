## 2024-05-24 - Accessibility on Icon-Only Buttons
**Learning:** Found multiple instances of icon-only buttons (like close modals) missing `aria-label`s, which makes them inaccessible to screen readers.
**Action:** Added `aria-label="Close dialog"` to `.dialog-close-btn` buttons across modal dialogs to improve screen reader accessibility. Added aria labels to navigation/search elements as well.
