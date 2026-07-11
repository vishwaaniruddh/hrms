## 2026-07-11 - Missing aria-label on icon-only buttons
**Learning:** The application frequently uses the `.btn-icon` class for icon-only buttons (e.g., in Member.jsx and Salary.jsx) that lack required `aria-label` attributes, leading to a recurring accessibility deficit for screen readers.
**Action:** Consistently audit `.btn-icon` usages and add descriptive `aria-label` attributes to ensure keyboard and screen reader accessibility for all icon-only interactive elements.
