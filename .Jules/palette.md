## 2024-05-18 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** Icon-only buttons using .btn-icon in this application frequently lack aria-label attributes, creating poor screen reader experiences.
**Action:** Always verify .btn-icon classes are accompanied by an aria-label describing the action (e.g., "More options", "Toggle user menu") when no text is present.
