## 2024-03-24 - Accessibility gaps in icon buttons
**Learning:** Many interactive icon elements (links and buttons) within `src/components/hrms/Member.jsx` use nested `<em class="icon">` tags without any accompanying text or `aria-label`s on the parent element, making them unreadable to screen readers.
**Action:** When adding or modifying interactive icon-only elements, always verify they contain an `aria-label` or visually hidden text to ensure accessibility standards are met.
