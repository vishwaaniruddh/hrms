## 2024-05-18 - Header Icon Buttons Lacking Context
**Learning:** The application's custom UI patterns frequently use icon-only buttons (e.g., leveraging the `.nk-quick-nav-icon` and `.nk-nav-toggle` classes) in the main navigation that natively lack accessibility context.
**Action:** Regularly scan for and add `aria-label` attributes to these elements when implementing UX improvements, especially in layout headers.
