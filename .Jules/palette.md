## 2024-08-03 - Missing ARIA Labels on Icon Buttons in HRMS Components
**Learning:** Found a recurring accessibility deficit in the `src/components/hrms/` directory where `.btn-icon` classes are used for icon-only buttons (like Search, Filter, Settings, More Options) without required `aria-label` attributes. This breaks screen reader accessibility for core data tables.
**Action:** Always verify `aria-label` is present when adding or modifying elements with the `.btn-icon` class, especially those containing only an `<em class="icon"></em>`.
