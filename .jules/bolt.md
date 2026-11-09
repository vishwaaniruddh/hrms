## 2024-11-09 - Memoize Breadcrumbs on Header
**Learning:** Found a performance bottleneck where Header.jsx renders on every change in the app due to its position in App.jsx. It recomputes `getBreadcrumbs` on every render because `getBreadcrumbs` was a function called directly instead of using `useMemo` based on `location.pathname`. This creates unnecessary string checks on every keystroke in children or unrelated re-renders.
**Action:** Extract expensive computations like string parsing out of render path using `useMemo` when possible, especially in top level layout components.
