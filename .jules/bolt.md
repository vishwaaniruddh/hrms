## 2024-05-24 - Route Code Splitting
**Learning:** `src/App.jsx` originally imported all route components statically, leading to a larger initial bundle size. Using `React.lazy` and `Suspense` is an effective and safe way to split code at the route level.
**Action:** When adding new routes to `src/App.jsx` or similar routing files, always use `React.lazy` for dynamic imports to maintain a lean initial bundle size.
