## 2024-09-26 - Adding ARIA labels to dialog close buttons

**Learning:** This codebase uses a custom `<button className="dialog-close-btn">` pattern for modal closures across numerous HRMS modules (AssetManagement, Attendance, ESS, etc.). These buttons rely solely on a nested Lucide `<X>` icon for visual affordance, completely lacking accessible names (e.g., `aria-label`). This causes screen readers to announce them ambiguously (e.g., "button"), severely impacting navigation for visually impaired users trying to dismiss dialogs.
**Action:** When auditing or implementing new dialog components in this custom design system, always explicitly verify that icon-only buttons (like `dialog-close-btn`) include an `aria-label` or `aria-labelledby` attribute to ensure screen reader compatibility.
