## 2025-05-31 - Route-Level Code Splitting
**Learning:** The application statically imported large, separate page components in `App.jsx`, which forced the browser to download the code for all routes on the initial load, causing longer Time To Interactive (TTI) and increased bundle sizes. In React 18 / React Router v6, using `React.lazy()` for route components effectively chunks the bundle automatically.
**Action:** Always implement code-splitting using `lazy()` and `<Suspense>` for top-level route components to prevent unused code from bloating the initial JavaScript payload.
