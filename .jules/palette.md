## 2024-05-18 - Missing ARIA Labels on Dialog Close Buttons
**Learning:** Dialog close buttons (`className="dialog-close-btn"`) across the HRMS component library were frequently missing `aria-label` attributes, which makes them completely invisible/unannounced to screen reader users when navigating modals.
**Action:** Always verify icon-only buttons, particularly those that handle core UI interactions like closing dialogs, have an explicit `aria-label` describing their action.
