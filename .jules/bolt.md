## 2024-05-24 - Memoize header breadcrumb computation
**Learning:** `location.pathname` triggered re-renders in `Header.jsx` can cause performance impacts. Re-calculating the breadcrumbs array on every render when only the path matters is inefficient. The array recreation breaks referential equality in `crumbs.map`.
**Action:** Use `useMemo` to memoize the result of `getBreadcrumbs()` based on `location.pathname`. This is a codebase-specific optimization since this Header component is rendered on every page view across the entire application and is part of the core layout.
