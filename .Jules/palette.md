## 2024-05-16 - Icon-only buttons lack ARIA labels
**Learning:** The legacy UI components use `.btn-icon` extensively without corresponding `aria-label`s, breaking accessibility for screen readers. This is a common pattern in components like `Salary.jsx`, `Member.jsx`, `MemberProfile.jsx`, and `Attendence.jsx`.
**Action:** When working on UI pages, actively search for `.btn-icon` classes and ensure they have appropriate `aria-label` attributes to maintain accessibility standards.
