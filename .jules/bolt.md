## 2024-10-20 - Redundant getStats API calls on pagination/filtering

**Learning:** In `Member.jsx`, `fetchStats()` is called within the same `useEffect` as `fetchMembers()`, which depends on `[fetchMembers]`. Since `fetchMembers` is recreated via `useCallback` whenever pagination (`page`) or filters (`search`, `filterDesignation`, `statusTab`) change, `fetchStats()` is redundantly called on every keystroke in search or every page change, making unnecessary network requests for global stats that do not depend on these filters.
**Action:** Separate `fetchStats()` into its own `useEffect` with an empty dependency array `[]` (to run only on mount) and ensure it is still called after mutations (add/edit/delete) to refresh the global stats.
