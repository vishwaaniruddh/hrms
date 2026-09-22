## 2023-10-25 - Icon-only buttons lacking accessible names
**Learning:** The codebase frequently relies on icon-only buttons (using `.btn-icon` classes) for critical interactions like search and menus, but omits `aria-label`s, making these actions confusing or invisible to screen reader users.
**Action:** Always include an `aria-label` (or visually hidden text) on any button or link that uses only an icon to convey its purpose.
