## 2024-06-09 - Code Splitting Routes

**Learning:** Route components in `src/App.jsx` have been refactored to use `React.lazy()` and `<Suspense>` for code splitting. This is a critical pattern for frontend performance in this application to keep the initial JavaScript bundle size small.

**Action:** Ensure any future routes added to `App.jsx` follow this dynamic loading pattern to maintain initial bundle performance.
