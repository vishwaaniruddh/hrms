## 2024-05-15 - Route Code Splitting
**Learning:** Found that the app routes (`src/App.jsx`) are statically imported, which causes all components to be loaded in the initial bundle.
**Action:** Implementing `React.lazy()` and `Suspense` for route components to optimize initial load time and split the bundle.
