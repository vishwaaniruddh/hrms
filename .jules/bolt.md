## 2024-05-24 - Memoize `toLowerCase()` before loops
**Learning:** Found an instance in `ManagerApprovals.jsx` where `.toLowerCase()` was repeatedly invoked on a dependency state (`searchTerm`) inside multiple `useMemo` filter loops. This is O(N) operations inside an O(N) array iteration, causing an O(N^2) impact over large arrays when evaluating multiple item keys per row.
**Action:** Extract `searchTerm.toLowerCase()` to a variable before running `.filter()`. This transforms the redundant string manipulations back to O(N).
