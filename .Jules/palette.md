## 2026-05-15 - Adding Aria Labels to Legacy Search/Dropdown UI Patterns
**Learning:** The application's custom UI patterns (e.g. `btn-icon`) frequently rely on icon-only links (`<em class="icon ni ..."></em>`) for primary interactions like search toggles and dropdown menus, natively lacking accessibility context.
**Action:** Add descriptive `aria-label` attributes to these interactive `btn-icon` elements to provide necessary context for screen reader users and improve overall keyboard accessibility.
