## 2024-05-18 - Missing ARIA labels on Icon-Only Buttons
**Learning:** The application's custom UI patterns frequently use icon-only buttons (leveraging the `.btn-icon` class) that natively lack accessibility context. These are present in headers, toolbars, and search components across multiple files like Salary.jsx, Member.jsx, and Attendence.jsx.
**Action:** Always scan for and add `aria-label` attributes to these elements when implementing UX improvements to ensure screen readers can announce the button's purpose.
