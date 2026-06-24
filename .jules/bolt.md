## 2024-06-24 - Route-level code splitting missing

**Learning:** Large React single-page applications often load all route components in the initial bundle, which can significantly slow down the Time to Interactive (TTI) and initial load time. In this app, `src/App.jsx` was importing all `hrms` route components synchronously. Using `React.lazy` and `Suspense` allows separating distinct route logic into lazy-loaded chunks.
**Action:** When working on large routing files, always check if heavy route components are being loaded synchronously. If they are, apply route-level code splitting using `React.lazy` and `Suspense` wrapping to improve the application's initial load performance.
