## 2024-10-09 - Missing ARIA Labels on Dialog Close Buttons
**Learning:** Found a widespread pattern where icon-only `X` buttons used to close dialogs across HRMS modules lacked `aria-label` attributes, making them inaccessible to screen readers.
**Action:** Always add `aria-label="Close dialog"` to icon-only close buttons (`className="dialog-close-btn"`) to ensure accessibility for visually impaired users.
