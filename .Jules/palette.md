## 2024-05-19 - Missing ARIA labels on multi-action dropdown menus
**Learning:** Found multiple instances of icon-only dropdown toggle buttons (`<em class="icon ni ni-more-h"></em>`) within lists (e.g. data tables for Salary, Attendance, Members) lacking `aria-label`s. This is a common accessibility anti-pattern that makes these buttons unclear for screen reader users.
**Action:** When finding `ni-more-h` and `ni-more-v` icons inside `btn-icon btn-trigger` dropdown buttons, add `aria-label="More options"` or a similar context-appropriate label to make the action clear.
