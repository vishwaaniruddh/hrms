## 2024-05-24 - Added aria-labels to icon-only buttons
**Learning:** Found a recurring accessibility pattern in HRMS components (like Salary, Member, MemberProfile, Attendence) where icon-only buttons use the `.btn-icon` class without `aria-label` attributes. This makes them inaccessible to screen readers.
**Action:** Always verify that elements with the `.btn-icon` class include a descriptive `aria-label` corresponding to their inner icon (e.g., Search, More options, Toggle menu, Back, Settings) to ensure keyboard and screen reader accessibility.
