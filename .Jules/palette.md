## 2024-05-20 - Missing ARIA Labels on Icon-only Buttons
**Learning:** The application extensively uses `.btn-icon` classes for icon-only buttons (e.g. `<em className="icon ni ni-*"></em>`) which inherently lack accessibility context for screen readers. This pattern is prevalent in headers, cards, and dropdown toggles across components like Member.jsx and MemberProfile.jsx.
**Action:** Always scan for `.btn-icon` lacking descriptive text when modifying components and consistently apply appropriate `aria-label` attributes to ensure they are accessible.
