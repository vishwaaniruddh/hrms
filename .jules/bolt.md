## 2024-05-24 - Route Code Splitting
**Learning:** Initial bundle size was large due to all route components being imported statically in `App.jsx`.
**Action:** Implemented React.lazy and Suspense for route components in `App.jsx` to reduce initial load time and split the bundle.
