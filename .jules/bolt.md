## 2024-05-18 - Header Breadcrumb Re-computation
**Learning:** `getBreadcrumbs` is called on every render in Header.jsx even though it only depends on `location.pathname`, which causes unnecessary computation.
**Action:** Wrap `getBreadcrumbs()` in `useMemo` with `[location.pathname]` as the dependency array.
