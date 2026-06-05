## 2024-06-05 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** The application heavily relies on legacy `.btn-icon` classes for actions like adding items, toggling search or filter panes, and dropdown menus without providing accessible names. Screen readers are completely unable to interpret these core interactive elements.
**Action:** Always scan for `.btn-icon` classes when reviewing or updating components and ensure they include descriptive `aria-label` attributes to make the application accessible.
