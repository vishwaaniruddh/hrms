## 2023-10-25 - React Component Re-renders from Repeated Array Filtering
**Learning:** In React components like `Salary.jsx`, complex chained array filters inside loops or render (e.g. `claims.filter(c => c.status === 'Pending').reduce(...)`) cause unnecessary calculations on every re-render, especially with large datasets, but the real bottleneck is when these arrays are calculated inline repeatedly.
**Action:** Extract repeated `.filter()` operations on large arrays (like `claims` or `tickets`) into a single `useMemo` calculation rather than computing them independently in multiple places.
