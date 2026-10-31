## 2024-10-31 - Memoized Intl.NumberFormat instantiation in Salary.jsx
**Learning:** Instantiating `Intl.NumberFormat` on every function call (e.g. `formatCurrency`) is a significant performance bottleneck in React components that render large lists or tables and need to format currency multiple times per row.
**Action:** Use `useMemo` to initialize a map of cached formatter instances, preventing repeated expensive object creations.
